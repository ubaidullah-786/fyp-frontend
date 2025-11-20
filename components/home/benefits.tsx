"use client";

import { motion } from "framer-motion";
import { Code, Smile, Atom, Shield } from "lucide-react";
import { ThemeSelector } from "@/components/theme-selector";

export default function BenefitsSection() {
  return (
    <section className="relative w-full py-16 md:py-24 bg-[rgb(250,250,250)] dark:bg-[rgb(0,0,0)]">
      <div className="container px-4 md:px-6 mx-auto">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl font-bold tracking-tighter text-[rgb(0,0,0)] dark:text-[rgb(237,237,237)] sm:text-5xl md:text-6xl">
            Benefits of clean code
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-4">
          <motion.div
            className="relative flex flex-col space-y-4 p-6 rounded-xl border border-[rgb(237,237,237)] dark:border-[rgb(50,50,50)] bg-white dark:bg-[rgb(10,10,10)] overflow-hidden"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            viewport={{ once: true }}
          >
            {/* Gradient overlay for dark mode only - extends beyond center to bottom third */}
            <div className="absolute left-[6px] right-[6px] top-[6px] bottom-1/3 rounded-t-[10px] bg-gradient-to-t from-black to-[rgb(30,30,30)] opacity-0 dark:opacity-100 pointer-events-none z-0"></div>

            <div className="relative w-16 h-16 z-10 flex items-center justify-center">
              <Code className="h-9 w-9 text-[rgb(0,0,0)] dark:text-[rgb(237,237,237)]" />
            </div>
            <h3 className="text-[20px] font-bold text-[rgb(0,0,0)] dark:text-[rgb(255,255,255)] relative z-10">
              Cleaner code, lower maintenance.
            </h3>
            <p className="text-[14px] text-[rgb(100,100,100)] dark:text-[rgb(136,136,136)] relative z-10">
              Clean Code is easier to read, reuse, and enhance, keeping
              maintenance time and costs to a minimum. Create well-organized
              scalable, reliable, and testable software that improves code
              quality.
            </p>
          </motion.div>

          <motion.div
            className="relative flex flex-col space-y-4 p-6 rounded-xl border border-[rgb(237,237,237)] dark:border-[rgb(50,50,50)] bg-white dark:bg-[rgb(10,10,10)] overflow-hidden"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
          >
            {/* Gradient overlay for dark mode only - extends beyond center to bottom third */}
            <div className="absolute left-[6px] right-[6px] top-[6px] bottom-1/3 rounded-t-[10px] bg-gradient-to-t from-black to-[rgb(30,30,30)] opacity-0 dark:opacity-100 pointer-events-none z-0"></div>

            <div className="relative w-16 h-16 z-10 flex items-center justify-center">
              <Smile className="h-9 w-9 text-[rgb(0,0,0)] dark:text-[rgb(237,237,237)]" />
            </div>
            <h3 className="text-[20px] font-bold text-[rgb(0,0,0)] dark:text-[rgb(255,255,255)] relative z-10">
              Keep your developers happy.
            </h3>
            <p className="text-[14px] text-[rgb(100,100,100)] dark:text-[rgb(136,136,136)] relative z-10">
              By keeping the most essential piece of your workplace - your code
              - clean, you create an enjoyable and satisfactory work environment
              for everyone. Clean Code is modular, easy to understand, and
              modifiable; helping improve developer collaboration.
            </p>
          </motion.div>

          <motion.div
            className="relative flex flex-col space-y-4 p-6 rounded-xl border border-[rgb(237,237,237)] dark:border-[rgb(50,50,50)] bg-white dark:bg-[rgb(10,10,10)] overflow-hidden"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            viewport={{ once: true }}
          >
            {/* Gradient overlay for dark mode only - extends beyond center to bottom third */}
            <div className="absolute left-[6px] right-[6px] top-[6px] bottom-1/3 rounded-t-[10px] bg-gradient-to-t from-black to-[rgb(30,30,30)] opacity-0 dark:opacity-100 pointer-events-none z-0"></div>

            <div className="relative w-16 h-16 z-10 flex items-center justify-center">
              <Atom className="h-9 w-9 text-[rgb(0,0,0)] dark:text-[rgb(237,237,237)]" />
            </div>
            <h3 className="text-[20px] font-bold text-[rgb(0,0,0)] dark:text-[rgb(255,255,255)] relative z-10">
              Rework less, innovate more.
            </h3>
            <p className="text-[14px] text-[rgb(100,100,100)] dark:text-[rgb(136,136,136)] relative z-10">
              Generate greater business value by empowering developers to focus
              on solving interesting problems instead of spending time on
              remediating old problems. Clean Code improves software quality and
              increases productivity, so you can deliver more features.
            </p>
          </motion.div>

          <motion.div
            className="relative flex flex-col space-y-4 p-6 rounded-xl border border-[rgb(237,237,237)] dark:border-[rgb(50,50,50)] bg-white dark:bg-[rgb(10,10,10)] overflow-hidden"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            viewport={{ once: true }}
          >
            {/* Gradient overlay for dark mode only - extends beyond center to bottom third */}
            <div className="absolute left-[6px] right-[6px] top-[6px] bottom-1/3 rounded-t-[10px] bg-gradient-to-t from-black to-[rgb(30,30,30)] opacity-0 dark:opacity-100 pointer-events-none z-0"></div>

            <div className="relative w-16 h-16 z-10 flex items-center justify-center">
              <Shield className="h-9 w-9 text-[rgb(0,0,0)] dark:text-[rgb(237,237,237)]" />
            </div>
            <h3 className="text-[20px] font-bold text-[rgb(0,0,0)] dark:text-[rgb(255,255,255)] relative z-10">
              Minimize risks, maximize reputation.
            </h3>
            <p className="text-[14px] text-[rgb(100,100,100)] dark:text-[rgb(136,136,136)] relative z-10">
              Code Doctor keeps your software robust and secure with the right
              checks at the right place and time. Limit the risk of introducing
              security vulnerabilities during the agile development process with
              code reviews.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
