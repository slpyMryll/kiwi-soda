"use client";

import React, { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { SidebarTask } from "@/types/pm"; 
import { getIsoWeekNumber } from "@/lib/utils/date-helpers"; 

interface TaskSidebarProps {
  tasks?: SidebarTask[];
}

export function TaskSidebar({ tasks = [] }: TaskSidebarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  const handlePrevMonth = () => setCurrentMonth(new Date(year, month - 1, 1));
  const handleNextMonth = () => setCurrentMonth(new Date(year, month + 1, 1));

  const weeks = useMemo(() => {
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const startOffset = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1; 
    const startDate = new Date(year, month, 1 - startOffset);

    const generatedWeeks = [];
    for (let i = 0; i < 6; i++) {
      const weekDays = [];
      const weekNum = getIsoWeekNumber(new Date(startDate)); 
      
      for (let j = 0; j < 7; j++) {
        weekDays.push(new Date(startDate));
        startDate.setDate(startDate.getDate() + 1);
      }
      
      generatedWeeks.push({ weekNum, days: weekDays });
      if (startDate.getMonth() !== month && i >= 3) break;
    }
    return generatedWeeks;
  }, [year, month]);

  const selectedDateTasks = useMemo(() => {
    return tasks.filter(task => {
      const taskDate = new Date(task.dueDate);
      return (
        taskDate.getDate() === selectedDate.getDate() &&
        taskDate.getMonth() === selectedDate.getMonth() &&
        taskDate.getFullYear() === selectedDate.getFullYear()
      );
    });
  }, [tasks, selectedDate]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending': return "bg-[#F3E9AD] text-[#857A3D]";
      case 'Completed': return "bg-[#C4E7D4] text-[#4A7C5F]";
      case 'In Progress': return "bg-blue-100 text-blue-700";
      default: return "bg-gray-100 text-gray-500";
    }
  };

  return (
    <div className="bg-white p-4 sm:p-6 lg:p-8 rounded-2xl shadow-sm border border-gray-100 space-y-8 h-full flex flex-col">
      <div className="flex flex-col">
        <h2 className="text-2xl sm:text-[26px] font-bold text-[#153B44] mb-1 sm:mb-2 tracking-tight">Task Timeline</h2>
        <p className="text-xs sm:text-[15px] text-gray-500 mb-6 sm:mb-8">Keep every council task on schedule</p>
        
        <div className="flex justify-center mb-6">
          <div className="flex items-center gap-1 bg-[#153B44] text-white px-2 py-1 rounded-md shadow-sm">
            <button onClick={handlePrevMonth} className="hover:bg-white/20 rounded p-0.5 transition-colors">
              <ChevronLeft className="w-4 h-4" strokeWidth={3} />
            </button>
            <span className="text-[12px] sm:text-[13px] font-medium min-w-20 text-center tracking-wide">
              {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
            </span>
            <button onClick={handleNextMonth} className="hover:bg-white/20 rounded p-0.5 transition-colors">
              <ChevronRight className="w-4 h-4" strokeWidth={3} />
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-8 gap-y-3 sm:gap-y-4 gap-x-1 sm:gap-x-2 items-center justify-items-center w-full">
          <span className="text-[11px] sm:text-[13px] font-medium text-[#153B44]">
            {String(month + 1).padStart(2, '0')}
          </span>
          {["Mo", "Tu", "We", "Th", "Fr"].map(day => (
            <span key={day} className="text-[11px] sm:text-[13px] font-medium text-gray-600">{day}</span>
          ))}
          <span className="text-[11px] sm:text-[13px] font-medium text-[#3B82F6]">Sa</span>
          <span className="text-[11px] sm:text-[13px] font-medium text-[#3B82F6]">Su</span>

          {weeks.map((week, wIdx) => (
            <React.Fragment key={wIdx}>
              <div className="w-6 h-6 min-[375px]:w-7 min-[375px]:h-7 sm:w-8 sm:h-8 rounded-md bg-[#153B44] text-white flex items-center justify-center text-[9px] min-[375px]:text-[10px] sm:text-xs font-medium">
                {week.weekNum}
              </div>

              {week.days.map((day, dIdx) => {
                const isWeekend = dIdx === 5 || dIdx === 6;
                const isSelected = selectedDate.getDate() === day.getDate() && selectedDate.getMonth() === day.getMonth();
                const hasTasks = tasks.some(t => {
                  const d = new Date(t.dueDate);
                  return d.getDate() === day.getDate() && d.getMonth() === day.getMonth();
                });

                return (
                  <button
                    key={dIdx}
                    onClick={() => setSelectedDate(day)}
                    className="relative w-6 h-6 min-[375px]:w-7 min-[375px]:h-7 sm:w-10 sm:h-10 flex items-center justify-center outline-none group"
                  >
                    <div className={cn(
                      "w-full h-full flex items-center justify-center rounded-full text-[11px] sm:text-[14px] transition-all duration-200",
                      hasTasks ? "bg-[#C4E7D4] text-[#153B44] font-medium shadow-sm" :
                      isSelected ? "border-2 border-[#153B44] font-bold text-[#153B44]" :
                      "hover:bg-gray-100",
                      !hasTasks && !isSelected && isWeekend ? "text-[#3B82F6]" : 
                      !hasTasks && !isSelected ? "text-gray-500" : ""
                    )}>
                      {day.getDate()}
                    </div>
                  </button>
                );
              })}
            </React.Fragment>
          ))}
        </div>
      </div>

      <div className="flex-1 flex flex-col pt-4 border-t border-gray-100">
        <h2 className="text-[20px] sm:text-[22px] font-bold text-[#153B44] mb-4 sm:mb-6 tracking-tight">Task Assignments</h2>
        
        <div className="flex justify-between items-center px-1 mb-3 sm:mb-4">
          <span className="text-[13px] sm:text-[15px] font-bold text-[#153B44]">Task</span>
          <span className="text-[13px] sm:text-[15px] font-bold text-[#153B44]">Status</span>
        </div>

        <div className="space-y-3 sm:space-y-4 flex-1 overflow-y-auto pr-1">
          {selectedDateTasks.length > 0 ? (
            selectedDateTasks.map((task) => (
              <div key={task.id} className="flex justify-between items-center group px-1 gap-2">
                <span className="text-[12px] sm:text-[14px] text-gray-500 truncate flex-1">{task.name}</span>
                <span className={cn("text-[9px] sm:text-[11px] px-2 sm:px-3.5 py-1 sm:py-1.5 rounded-full font-medium shadow-sm shrink-0", getStatusColor(task.status))}>
                  {task.status}
                </span>
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center h-24 text-center space-y-2 opacity-60">
              <CalendarIcon className="w-5 h-5 sm:w-6 sm:h-6 text-gray-300" />
              <p className="text-[11px] sm:text-[12px] text-gray-400 font-medium">No tasks assigned<br/>for this date.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}