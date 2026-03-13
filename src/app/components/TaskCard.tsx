import { motion } from "motion/react";
import { LucideIcon } from "lucide-react";
import { ChevronDown } from "lucide-react";

interface Task {
  id: number;
  title: string;
  icon: LucideIcon;
  color: string;
  items: string[];
}

interface TaskCardProps {
  task: Task;
  index: number;
  isSelected: boolean;
  onSelect: () => void;
}

export function TaskCard({ task, index, isSelected, onSelect }: TaskCardProps) {
  const Icon = task.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="relative"
    >
      <div
        className={`rounded-xl border backdrop-blur-sm transition-all duration-300 cursor-pointer ${
          isSelected
            ? "bg-white/10 border-white/30 shadow-2xl"
            : "bg-white/5 border-white/10 hover:bg-white/8 hover:border-white/20"
        }`}
        onClick={onSelect}
      >
        {/* Header */}
        <div className="p-6">
          <div className="flex items-center gap-4">
            {/* Number Badge */}
            <div className="flex-shrink-0">
              <div
                className={`w-12 h-12 rounded-lg bg-gradient-to-br ${task.color} flex items-center justify-center shadow-lg`}
              >
                <span className="text-white text-xl">
                  {index + 1}
                </span>
              </div>
            </div>

            {/* Icon and Title */}
            <div className="flex-1 flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${task.color} bg-opacity-20 flex items-center justify-center`}>
                <Icon className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-white text-xl">{task.title}</h3>
            </div>

            {/* Expand Icon */}
            <motion.div
              animate={{ rotate: isSelected ? 180 : 0 }}
              transition={{ duration: 0.3 }}
              className="flex-shrink-0"
            >
              <ChevronDown className="w-5 h-5 text-slate-400" />
            </motion.div>
          </div>
        </div>

        {/* Content */}
        <motion.div
          initial={false}
          animate={{
            height: isSelected ? "auto" : 0,
            opacity: isSelected ? 1 : 0,
          }}
          transition={{ duration: 0.3 }}
          className="overflow-hidden"
        >
          <div className="px-6 pb-6">
            <div className="pl-16">
              <div className="border-l-2 border-white/20 pl-4 space-y-4">
                {task.items.map((item, itemIndex) => (
                  <motion.div
                    key={itemIndex}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: itemIndex * 0.1 }}
                    className="flex items-start gap-3"
                  >
                    <div className={`w-2 h-2 rounded-full bg-gradient-to-br ${task.color} mt-2 flex-shrink-0`} />
                    <p className="text-slate-300 leading-relaxed">{item}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Connection Line to Next Card */}
      {index < 4 && (
        <div className="absolute left-6 top-full w-0.5 h-6 bg-gradient-to-b from-white/20 to-transparent" />
      )}
    </motion.div>
  );
}
