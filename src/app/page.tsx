"use client"
import LeftPanel from "@/components/home/left-panel";
import RightPanel from "@/components/home/right-panel";

export default function Home() {
  return (
    <main className='m-5'>
      {/* bg-left-panel is a variable in global.css and it is also added in the tailwind-config file. it works dynamically for both light and dark mode as it is mentioned in the global.css with two different values */}
      <div className='flex overflow-y-hidden h-[calc(100vh-50px)] max-w-[1700px] mx-auto bg-left-panel'>
        {/* Green background decorator for Light Mode */}
        <div className='fixed top-0 left-0 w-full h-36 bg-green-primary dark:bg-transparent -z-30' />
        <LeftPanel />
        <RightPanel />
      </div>
    </main>
  );
}