"use client";

import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

export function HeroSection() {
  const router = useRouter();

  return (
    <>
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[rgb(250,250,250)] dark:bg-[rgb(0,0,0)]">
        {/* Animated gradient orbs */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-blue-500/20 via-purple-500/10 to-transparent dark:from-blue-600/20 dark:via-purple-600/10 rounded-full blur-3xl"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          <motion.div
            className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-cyan-500/20 via-emerald-500/10 to-transparent dark:from-cyan-600/20 dark:via-emerald-600/10 rounded-full blur-3xl"
            animate={{
              scale: [1.2, 1, 1.2],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1,
            }}
          />
        </div>

        {/* Content */}
        <div className="relative container px-4 md:px-6 mx-auto">
          <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
            <motion.div
              className="flex flex-col justify-center space-y-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="space-y-4">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none text-[rgb(0,0,0)] dark:text-[rgb(237,237,237)]">
                  Detect Code Smells & Refactor with Confidence
                </h1>
                <p className="max-w-[600px] text-[rgb(136,136,136)] md:text-xl">
                  AI-generated or written by humans, Code Doctor's Clean Code
                  Solutions cover your code quality needs, improving code
                  reliability, maintainability, and security.
                </p>
                <div className="pt-2">
                  <Button
                    onClick={() => router.push("/signup")}
                    size="lg"
                    className="text-base font-medium bg-[rgb(0,0,0)] dark:bg-[rgb(237,237,237)] text-[rgb(255,255,255)] dark:text-[rgb(0,0,0)] hover:bg-[rgb(30,30,30)] dark:hover:bg-[rgb(220,220,220)] border border-[rgb(237,237,237)] dark:border-[rgb(237,237,237)] cursor-pointer"
                    style={{ borderRadius: "6px" }}
                  >
                    Get Started
                  </Button>
                </div>
              </div>
            </motion.div>
            <motion.div
              className="flex items-center justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="relative h-[350px] w-full overflow-hidden rounded-xl border border-[rgb(237,237,237)] dark:border-[rgb(50,50,50)] bg-gradient-to-b from-blue-50 to-white p-4 shadow-xl dark:bg-gradient-to-b dark:from-[rgb(10,10,10)] dark:to-[rgb(20,20,20)]">
                <div className="absolute inset-0 bg-grid-black/5 [mask-image:linear-gradient(to_bottom,white,transparent)] dark:bg-grid-white/5" />
                <div className="relative h-full w-full overflow-hidden rounded-lg border border-[rgb(237,237,237)] dark:border-[rgb(50,50,50)] bg-white shadow-sm dark:bg-[rgb(10,10,10)]">
                  <div className="flex h-10 items-center border-b border-[rgb(237,237,237)] dark:border-[rgb(50,50,50)] bg-gray-50 px-4 dark:bg-[rgb(20,20,20)]">
                    <div className="flex space-x-2">
                      <div className="h-3 w-3 rounded-full bg-red-400" />
                      <div className="h-3 w-3 rounded-full bg-yellow-400" />
                      <div className="h-3 w-3 rounded-full bg-green-400" />
                    </div>
                    <div className="ml-4 text-sm font-medium text-[rgb(0,0,0)] dark:text-[rgb(237,237,237)]">
                      Code Doctor Analysis
                    </div>
                  </div>
                  <div className="p-4 font-mono text-sm dark:bg-[rgb(10,10,10)]">
                    <motion.div
                      className="mb-2 text-blue-600 dark:text-blue-400"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3, delay: 0.5 }}
                    >
                      {"// Code smell detected: Long Method"}
                    </motion.div>
                    <motion.div
                      className="mb-4 text-gray-700 dark:text-gray-300"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3, delay: 0.7 }}
                    >
                      <span className="text-gray-500 dark:text-gray-400">
                        function
                      </span>{" "}
                      <span className="text-blue-600 dark:text-blue-400">
                        processData
                      </span>
                      (data) {"{"}
                      <br />
                      &nbsp;&nbsp;
                      <span className="text-gray-500 dark:text-gray-400">
                        {"   // This method is too long (50+ lines)"}
                      </span>
                      <br />
                      &nbsp;&nbsp;
                      <span className="text-gray-500 dark:text-gray-400">
                        {
                          "  // Consider breaking it down into smaller functions"
                        }
                      </span>
                      <br />
                      {"}"}
                    </motion.div>
                    <motion.div
                      className="mb-2 text-green-600 dark:text-green-400"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3, delay: 0.9 }}
                    >
                      {"    // Suggested refactoring:"}
                    </motion.div>
                    <motion.div
                      className="text-gray-700 dark:text-gray-300"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3, delay: 1.1 }}
                    >
                      <span className="text-gray-500 dark:text-gray-400">
                        function
                      </span>{" "}
                      <span className="text-blue-600 dark:text-blue-400">
                        processData
                      </span>
                      (data) {"{"}
                      <br />
                      &nbsp;&nbsp;
                      <span className="text-blue-600 dark:text-blue-400">
                        validateInput
                      </span>
                      (data);
                      <br />
                      &nbsp;&nbsp;
                      <span className="text-gray-500 dark:text-gray-400">
                        const
                      </span>{" "}
                      processed ={" "}
                      <span className="text-blue-600 dark:text-blue-400">
                        transformData
                      </span>
                      (data);
                      <br />
                      &nbsp;&nbsp;
                      <span className="text-gray-500 dark:text-gray-400">
                        return
                      </span>{" "}
                      <span className="text-blue-600 dark:text-blue-400">
                        formatOutput
                      </span>
                      (processed);
                      <br />
                      {"}"}
                    </motion.div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Real-time Analysis Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-[rgb(250,250,250)] dark:bg-[rgb(0,0,0)]">
        <div className="container px-4 md:px-6 mx-auto">
          <motion.div
            className="grid gap-6 lg:grid-cols-2 lg:gap-12"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <div className="flex flex-col justify-center space-y-4">
              <div className="space-y-2">
                <div className="inline-block rounded-md bg-[rgb(245,245,245)] dark:bg-[rgb(20,20,20)] px-3 py-1 text-sm text-[rgb(0,0,0)] dark:text-[rgb(237,237,237)] border border-[rgb(237,237,237)] dark:border-[rgb(50,50,50)]">
                  Real-time Analysis
                </div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-[rgb(0,0,0)] dark:text-[rgb(237,237,237)]">
                  Improve Code Quality in Real-Time
                </h2>
                <p className="max-w-[600px] text-[rgb(136,136,136)] md:text-xl">
                  Code Doctor analyzes your code as you write, providing
                  immediate feedback and suggestions for improvement.
                </p>
              </div>
              <ul className="grid gap-2">
                <motion.li
                  className="flex items-center gap-2 text-[rgb(0,0,0)] dark:text-gray-300"
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                  viewport={{ once: true }}
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-[rgb(0,0,0)] dark:bg-[rgb(237,237,237)]" />
                  <span>Instant feedback on code quality</span>
                </motion.li>
                <motion.li
                  className="flex items-center gap-2 text-[rgb(0,0,0)] dark:text-gray-300"
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.2 }}
                  viewport={{ once: true }}
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-[rgb(0,0,0)] dark:bg-[rgb(237,237,237)]" />
                  <span>Detailed explanations of detected issues</span>
                </motion.li>
                <motion.li
                  className="flex items-center gap-2 text-[rgb(0,0,0)] dark:text-gray-300"
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.3 }}
                  viewport={{ once: true }}
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-[rgb(0,0,0)] dark:bg-[rgb(237,237,237)]" />
                  <span>One-click refactoring suggestions</span>
                </motion.li>
                <motion.li
                  className="flex items-center gap-2 text-[rgb(0,0,0)] dark:text-gray-300"
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.4 }}
                  viewport={{ once: true }}
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-[rgb(0,0,0)] dark:bg-[rgb(237,237,237)]" />
                  <span>Educational resources to improve coding practices</span>
                </motion.li>
              </ul>
            </div>
            <motion.div
              className="flex items-center justify-center"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              <div className="relative h-[400px] w-full overflow-hidden rounded-xl border border-[rgb(237,237,237)] dark:border-[rgb(50,50,50)] bg-white p-4 shadow-xl dark:bg-[rgb(10,10,10)]">
                <div className="flex h-10 items-center border-b border-[rgb(237,237,237)] dark:border-[rgb(50,50,50)] bg-gray-50 px-4 dark:bg-[rgb(20,20,20)]">
                  <div className="flex space-x-2">
                    <div className="h-3 w-3 rounded-full bg-red-400" />
                    <div className="h-3 w-3 rounded-full bg-yellow-400" />
                    <div className="h-3 w-3 rounded-full bg-green-400" />
                  </div>
                  <div className="ml-4 text-sm font-medium text-[rgb(0,0,0)] dark:text-[rgb(237,237,237)]">
                    Real-time Analysis
                  </div>
                </div>
                <div className="p-4 font-mono text-sm dark:bg-[rgb(10,10,10)]">
                  <div className="flex items-center space-x-2 text-gray-700 dark:text-gray-300">
                    <div className="h-4 w-4 rounded-full bg-green-500" />
                    <span>Code quality score: 85/100</span>
                  </div>
                  <div className="mt-4 space-y-2">
                    <motion.div
                      className="rounded-md bg-yellow-50 p-2 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300"
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      transition={{ duration: 0.3, delay: 0.5 }}
                      viewport={{ once: true }}
                    >
                      <span className="font-bold">Warning:</span> Duplicate code
                      detected in utils/helpers.js
                    </motion.div>
                    <motion.div
                      className="rounded-md bg-red-50 p-2 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      transition={{ duration: 0.3, delay: 0.7 }}
                      viewport={{ once: true }}
                    >
                      <span className="font-bold">Critical:</span> Memory leak
                      in components/Modal.jsx
                    </motion.div>
                    <motion.div
                      className="rounded-md bg-blue-50 p-2 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      transition={{ duration: 0.3, delay: 0.9 }}
                      viewport={{ once: true }}
                    >
                      <span className="font-bold">Suggestion:</span> Extract
                      method from UserService.processPayment()
                    </motion.div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </>
  );
}
