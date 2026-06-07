import { requireUser } from "@/lib/auth";
import Chat from "@/components/Chat";

export default async function StudentChatPage() {
  await requireUser();
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">先生とのチャット</h1>
      <p className="text-sm text-slate-500">授業の質問や連絡に使えます。</p>
      <Chat />
    </div>
  );
}
