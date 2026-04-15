import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Wallet } from 'lucide-react'
import { Button } from "@/components/ui/button"

export function HeroSection() {
    const [animationComplete, setAnimationComplete] = useState(false)

    useEffect(() => {
        const timer = setTimeout(() => setAnimationComplete(true), 500)
        return () => clearTimeout(timer)
    }, [])

    return (
        <>

            <div className="flex mb-8 flex-col justify-center items-center">
                <motion.div
                    initial={{ scale: 2 }}
                    animate={{
                        scale: animationComplete ? 1 : 2,
                        y: animationComplete ? 0 : -50,
                    }}
                    transition={{
                        duration: 1,
                        ease: "easeInOut",
                    }}
                >
                    <div className={`bg-button p-4 rounded-[2rem] shadow-blue-blur`}>
                        <Wallet
                            className="size-20 xl:size-28 text-blue-500 border-2 rounded-b-full p-4"
                            strokeWidth={1.5}
                        />
                    </div>
                </motion.div>
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{
                        opacity: animationComplete ? 1 : 0,
                        y: animationComplete ? 0 : -20,
                    }}
                    transition={{ delay: 1, duration: 0.5 }}
                    className="flex justify-center -bottom-10 md:-bottom-11 transform w-full text-center"
                >
                    <span className="md:text-4xl text-3xl font-semibold text-button drop-shadow-blue-blur">
                        Peyrelongue SA
                    </span>
                </motion.div>
            </div>

            <motion.h1
                initial={{ opacity: 0, y: 100 }}
                animate={{
                    opacity: animationComplete ? 1 : 0,
                    y: animationComplete ? 0 : 100,
                }}
                transition={{ delay: 0.3, duration: 0.8 }}
                className="text-4xl md:text-4xl xl:text-5xl font-bold text-center mb-4 mx-2 mt-6 xl:mt-20"
            >
                Gestiona tu negocio de forma eficiente
            </motion.h1>

            <motion.p
                initial={{ opacity: 0, y: 100 }}
                animate={{
                    opacity: animationComplete ? 1 : 0,
                    y: animationComplete ? 0 : 100,
                }}
                transition={{ delay: 0.3, duration: 0.8 }}
                className="text-center text-base md:text-xl xl:text-2xl text-gray-600 dark:text-muted-foreground max-w-2xl px-4 mb-6"
            >
                Sistema que permite automatizar la generación de reportes, centralizar la información y ofrecer herramientas de análisis.
            </motion.p>

            <motion.div
                initial={{ opacity: 0, y: 100 }}
                animate={{
                    opacity: animationComplete ? 1 : 0,
                    y: animationComplete ? 0 : 100,
                }}
                transition={{ delay: 0.5, duration: 0.8 }}
            >
                <Button
                    variant={"ghost"}
                    className="bg-blue-500 text-xl md:text-2xl xl:text-3xl p-5 md:p-6 xl:p-8 transition-all hover:scale-110 active:scale-95 rounded-2xl text-white hover:bg-button shadow-blue-blur"
                    onClick={() => (window.location.href = "/dashboard")}
                >
                    Empezar
                </Button>
            </motion.div>
        </>
    );
}