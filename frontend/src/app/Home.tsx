// import { motion } from 'framer-motion';
// import ButtonMenu from '@/modules/admin-panel/nav/ButtonMenu';
// import { useTheme } from '@/components/theme-provider';
// import { Moon, Sun } from 'lucide-react';
// import { HeroSection } from '@/modules/home/Hero';

// // src/pages/Home.tsx
// const Home = () => {
//   const { theme, setTheme } = useTheme();
//   // const { value } = useAppSelector(state => state.counter)

//   return (
//     <div className="h-screen w-full flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-800/10 relative dark:bg-[url('/assets/background/grain-bg.svg')] dark:bg-auto dark:bg-repeat">
//       <motion.div
//         initial={{ y: -50, opacity: 0 }}
//         animate={{ y: 0, opacity: 1 }}
//         transition={{ delay: 1.5, duration: 0.5 }}
//         className="absolute top-4 left-4"
//       >
//         <button
//           onClick={() => setTheme(theme === "light" ? "dark" : "light")}
//           className="p-2 rounded-md"
//         >
//           {theme === "light" ? <Sun size={20} /> : <Moon size={20} />}
//         </button>
//       </motion.div>

//       <motion.div
//         initial={{ y: -50, opacity: 0 }}
//         animate={{ y: 0, opacity: 1 }}
//         transition={{ delay: 1.5, duration: 0.5 }}
//         className="absolute top-4 right-4"
//       >
//         <ButtonMenu />
//       </motion.div>

//       <HeroSection />
//     </div>
//   );
// };

// export default Home;
