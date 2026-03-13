from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from reportlab.lib.pagesizes import letter, A4
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, PageBreak
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.lib import colors
from io import BytesIO
import os
from datetime import datetime
from database import get_db
from models import User, Collection, CollectibleItem
from schemas import PDFExportRequest
from auth import get_current_user

router = APIRouter(prefix="/export", tags=["export"])


@router.post("/pdf-collection/{collection_id}")
async def export_collection_to_pdf(
    collection_id: int,
    include_images: bool = True,
    include_custom_fields: bool = True,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Export a collection to PDF"""
    collection = db.query(Collection).filter(
        Collection.id == collection_id,
        Collection.user_id == current_user.id
    ).first()
    
    if not collection:
        raise HTTPException(status_code=404, detail="Collection not found")
    
    # Create PDF
    pdf_buffer = BytesIO()
    doc = SimpleDocTemplate(pdf_buffer, pagesize=A4)
    styles = getSampleStyleSheet()
    story = []
    
    # Title
    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Heading1'],
        fontSize=24,
        textColor=colors.HexColor('#2c3e50'),
        spaceAfter=30,
        alignment=1
    )
    story.append(Paragraph(collection.name, title_style))
    
    # Collection info
    if collection.description:
        story.append(Paragraph(f"<b>Description:</b> {collection.description}", styles['Normal']))
    story.append(Paragraph(f"<b>Created:</b> {collection.created_at.strftime('%Y-%m-%d')}", styles['Normal']))
    story.append(Spacer(1, 0.3 * inch))
    
    # Collection statistics
    total_items = len(collection.items)
    total_value = sum(item.cost for item in collection.items)
    
    stats_data = [
        ["Total Items", str(total_items)],
        ["Total Value", f"${total_value:,.2f}"],
    ]
    
    stats_table = Table(stats_data, colWidths=[2 * inch, 2 * inch])
    stats_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.lightgrey),
        ('TEXTCOLOR', (0, 0), (-1, -1), colors.black),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('FONTNAME', (0, 0), (-1, -1), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 12),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 12),
        ('GRID', (0, 0), (-1, -1), 1, colors.black)
    ]))
    story.append(stats_table)
    story.append(Spacer(1, 0.3 * inch))
    story.append(PageBreak())
    
    # Items
    story.append(Paragraph("Collection Items", styles['Heading2']))
    story.append(Spacer(1, 0.15 * inch))
    
    # Create items table
    items_data = [["Name", "Type", "Cost", "Date", "ID"]]
    
    for item in collection.items:
        items_data.append([
            item.name[:30],
            item.item_type.value,
            f"${item.cost:,.2f}",
            item.acquisition_date.strftime('%Y-%m-%d'),
            item.item_id
        ])
    
    items_table = Table(items_data, colWidths=[2 * inch, 1.2 * inch, 1.2 * inch, 1.2 * inch, 1 * inch])
    items_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 11),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
        ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
        ('GRID', (0, 0), (-1, -1), 1, colors.black),
        ('FONTSIZE', (0, 1), (-1, -1), 9),
    ]))
    story.append(items_table)
    
    # Add custom fields if requested
    if include_custom_fields and any(item.custom_fields_data for item in collection.items):
        story.append(PageBreak())
        story.append(Paragraph("Custom Fields Details", styles['Heading2']))
        story.append(Spacer(1, 0.15 * inch))
        
        for item in collection.items:
            if item.custom_fields_data:
                story.append(Paragraph(f"<b>{item.name}</b>", styles['Heading3']))
                fields_data = [[k, str(v)] for k, v in item.custom_fields_data.items()]
                fields_table = Table(fields_data, colWidths=[2.5 * inch, 2.5 * inch])
                fields_table.setStyle(TableStyle([
                    ('BACKGROUND', (0, 0), (-1, -1), colors.lightgrey),
                    ('GRID', (0, 0), (-1, -1), 1, colors.black),
                ]))
                story.append(fields_table)
                story.append(Spacer(1, 0.2 * inch))
    
    # Build PDF
    doc.build(story)
    pdf_buffer.seek(0)
    
    # Create file response
    filename = f"collection_{collection_id}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.pdf"
    
    return FileResponse(
        pdf_buffer,
        media_type="application/pdf",
        filename=filename
    )


@router.post("/pdf-all-collections")
async def export_all_collections_to_pdf(
    include_images: bool = True,
    include_custom_fields: bool = True,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Export all user's collections to a single PDF"""
    collections = db.query(Collection).filter(
        Collection.user_id == current_user.id
    ).all()
    
    if not collections:
        raise HTTPException(status_code=404, detail="No collections found")
    
    # Create PDF
    pdf_buffer = BytesIO()
    doc = SimpleDocTemplate(pdf_buffer, pagesize=A4)
    styles = getSampleStyleSheet()
    story = []
    
    # Overall title
    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Heading1'],
        fontSize=28,
        textColor=colors.HexColor('#2c3e50'),
        spaceAfter=10,
        alignment=1
    )
    story.append(Paragraph(f"{current_user.first_name}'s Collections", title_style))
    story.append(Paragraph(f"Exported on {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}", styles['Normal']))
    story.append(Spacer(1, 0.3 * inch))
    
    # Overall statistics
    total_items = sum(len(col.items) for col in collections)
    total_value = sum(sum(item.cost for item in col.items) for col in collections)
    
    overall_stats = [
        ["Total Collections", str(len(collections))],
        ["Total Items", str(total_items)],
        ["Total Value", f"${total_value:,.2f}"],
    ]
    
    overall_table = Table(overall_stats, colWidths=[2.5 * inch, 2.5 * inch])
    overall_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.lightgrey),
        ('TEXTCOLOR', (0, 0), (-1, -1), colors.black),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('FONTNAME', (0, 0), (-1, -1), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 12),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 12),
        ('GRID', (0, 0), (-1, -1), 1, colors.black)
    ]))
    story.append(overall_table)
    story.append(PageBreak())
    
    # Add each collection
    for idx, collection in enumerate(collections):
        if idx > 0:
            story.append(PageBreak())
        
        # Collection title
        story.append(Paragraph(collection.name, styles['Heading2']))
        if collection.description:
            story.append(Paragraph(collection.description, styles['Normal']))
        story.append(Spacer(1, 0.15 * inch))
        
        # Collection stats
        col_items_count = len(collection.items)
        col_value = sum(item.cost for item in collection.items)
        
        col_stats = [
            ["Items", str(col_items_count)],
            ["Total Value", f"${col_value:,.2f}"],
        ]
        
        col_table = Table(col_stats, colWidths=[2 * inch, 2 * inch])
        col_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, -1), colors.lightgrey),
            ('GRID', (0, 0), (-1, -1), 1, colors.black),
        ]))
        story.append(col_table)
        story.append(Spacer(1, 0.15 * inch))
        
        # Items table
        items_data = [["Name", "Type", "Cost", "Date", "ID"]]
        for item in collection.items:
            items_data.append([
                item.name[:25],
                item.item_type.value,
                f"${item.cost:,.2f}",
                item.acquisition_date.strftime('%Y-%m-%d'),
                item.item_id
            ])
        
        items_table = Table(items_data, colWidths=[1.8 * inch, 1 * inch, 1 * inch, 1 * inch, 0.8 * inch])
        items_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 10),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 10),
            ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
            ('GRID', (0, 0), (-1, -1), 1, colors.black),
            ('FONTSIZE', (0, 1), (-1, -1), 8),
        ]))
        story.append(items_table)
    
    # Build PDF
    doc.build(story)
    pdf_buffer.seek(0)
    
    # Create file response
    filename = f"all_collections_{datetime.now().strftime('%Y%m%d_%H%M%S')}.pdf"
    
    return FileResponse(
        pdf_buffer,
        media_type="application/pdf",
        filename=filename
    )
