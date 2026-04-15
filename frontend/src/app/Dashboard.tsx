import { HeroSection } from '@/modules/home/Hero';
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/clerk-react";

// src/pages/Home.tsx
const Home = () => {
  // const { value } = useAppSelector(state => state.counter)

  return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-800/10 relative dark:bg-[url('/assets/background/grain-bg.svg')] dark:bg-auto dark:bg-repeat">
      <header>
        <SignedOut>
          <SignInButton />
        </SignedOut>
        <SignedIn>
          <UserButton />
        </SignedIn>
      </header>
      <HeroSection />
    </div>
  );
};

export default Home;
