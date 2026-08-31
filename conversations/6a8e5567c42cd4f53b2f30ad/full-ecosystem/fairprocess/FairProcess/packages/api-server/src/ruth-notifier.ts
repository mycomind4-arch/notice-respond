export interface NotifyRuthParams {
  caseId: string;
  reportId: string;
}

export async function notifyRuthOfAuthorizedReport(params: NotifyRuthParams): Promise<void> {
  const ruthSupabaseUrl = process.env.RUTH_SUPABASE_URL;
  const ruthServiceRoleKey = process.env.RUTH_SERVICE_ROLE_KEY;

  if (!ruthSupabaseUrl || !ruthServiceRoleKey) {
    return;
  }

  try {
    const url = `${ruthSupabaseUrl}/functions/v1/import-fairprocess-case`;
    console.log(`[ruth-notifier] Sending authorized report ${params.reportId} for case ${params.caseId} to Ruth Flow at ${url}`);

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${ruthServiceRoleKey}`,
      },
      body: JSON.stringify({ caseId: params.caseId }),
    });

    if (!response.ok) {
      const responseText = await response.text().catch(() => "");
      console.error(
        `[ruth-notifier] Failed to notify Ruth Flow. Status: ${response.status} ${response.statusText}. Response: ${responseText}`
      );
    } else {
      console.log(`[ruth-notifier] Successfully notified Ruth Flow for case ${params.caseId}`);
    }
  } catch (error) {
    console.error(`[ruth-notifier] Exception occurred while notifying Ruth Flow:`, error);
  }
}
