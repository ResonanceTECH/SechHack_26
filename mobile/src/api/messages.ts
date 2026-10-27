import { request } from "./client";

export interface MobileMessage {
  id: string;
  sender_id: string;
  recipient_id: string;
  patient_id: string | null;
  body: string;
  is_read: boolean;
  created_at: string | null;
}

export async function listMessages(patientId?: string): Promise<MobileMessage[]> {
  const suffix = patientId ? `?patient_id=${encodeURIComponent(patientId)}` : "";
  const data = await request<{ items: MobileMessage[]; total: number }>(`/api/v1/messages${suffix}`);
  return data.items ?? [];
}

export async function sendMessage(recipientId: string, body: string, patientId?: string): Promise<MobileMessage> {
  return request<MobileMessage>("/api/v1/messages", {
    method: "POST",
    body: { recipient_id: recipientId, patient_id: patientId ?? null, body },
  });
}

export async function markMessageRead(id: string): Promise<void> {
  await request(`/api/v1/messages/${id}/read`, { method: "PATCH" });
}