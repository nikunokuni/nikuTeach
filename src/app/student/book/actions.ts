"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { bookSlot } from "@/lib/booking";

export async function bookSlotAction(formData: FormData) {
  const user = await requireUser();
  if (user.role !== "STUDENT") return;
  const slotId = String(formData.get("slotId") || "");
  const result = await bookSlot(slotId, user.id);
  revalidatePath("/student/book");
  revalidatePath("/student");
  if ("lesson" in result && result.lesson) {
    redirect(`/student/lessons/${result.lesson.id}`);
  }
}
