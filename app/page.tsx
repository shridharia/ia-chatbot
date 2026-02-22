import { ChatWindow } from "@/components/ChatWindow";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-100 p-4 dark:bg-zinc-950">
      <div className="h-[600px] w-full max-w-2xl">
        <ChatWindow />
      </div>
    </div>
  );
}
