const GITHUB_REPO_DISPATCH_URL =
  "https://api.github.com/repos/chiragdhunna/chiragdhunna.github.io/dispatches";

type CmsEventType =
  | "add-project"
  | "update-project"
  | "delete-project"
  | "add-cert"
  | "update-cert"
  | "delete-cert";

type BaseSubmission = {
  id?: string;
  slug?: string;
  name: string;
  description?: string;
};

export type ProjectSubmission = BaseSubmission & {
  description: string;
  projectUrl: string;
  demoUrl?: string;
  tags?: string[];
  imageFile: File;
};

export type CertSubmission = BaseSubmission & {
  issuer: string;
  issueDate: string;
  credentialUrl?: string;
  imageFile: File;
  pdfFile?: File | null;
};

function getGitHubPat(): string {
  const pat = import.meta.env.VITE_GITHUB_PAT;

  if (!pat) {
    throw new Error("VITE_GITHUB_PAT is not configured");
  }

  return pat;
}

function sanitizeSlug(value: string): string {
  const slug = value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  if (!slug) {
    throw new Error("Unable to derive a valid slug");
  }

  return slug;
}

async function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
        return;
      }

      reject(new Error("Unexpected file reader result"));
    };
    reader.readAsDataURL(file);
  });
}

async function resizeImageToBase64(
  file: File,
  maxWidth = 1200,
): Promise<string> {
  const source = await createImageBitmap(file);
  const width = Math.min(source.width, maxWidth);
  const height = Math.round((source.height * width) / source.width);
  const canvas = document.createElement("canvas");

  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("Canvas 2D context is unavailable");
  }

  context.drawImage(source, 0, 0, width, height);
  source.close();

  const dataUrl = canvas.toDataURL("image/jpeg", 0.92);

  return dataUrl.split(",")[1] ?? "";
}

function stripDataUrlPrefix(value: string): string {
  return value.includes(",") ? (value.split(",", 2)[1] ?? "") : value;
}

async function fileToBase64(file: File): Promise<string> {
  return stripDataUrlPrefix(await fileToDataUrl(file));
}

export async function dispatchCmsEvent(
  eventType: CmsEventType,
  data: Record<string, unknown>,
  adminToken: string,
): Promise<void> {
  const response = await fetch(GITHUB_REPO_DISPATCH_URL, {
    method: "POST",
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${getGitHubPat()}`,
      "Content-Type": "application/json",
      "X-Admin-Token": adminToken,
    },
    body: JSON.stringify({
      event_type: eventType,
      client_payload: {
        ...data,
        admin_token: adminToken,
      },
    }),
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(
      `Failed to dispatch CMS event (${response.status}): ${message || response.statusText}`,
    );
  }
}

export async function addProject(
  input: ProjectSubmission,
  adminToken: string,
): Promise<void> {
  const slug = sanitizeSlug(input.slug || input.name);
  const imageBase64 = await resizeImageToBase64(input.imageFile);

  await dispatchCmsEvent(
    "add-project",
    {
      id: input.id ?? slug,
      slug,
      name: input.name,
      description: input.description,
      projectUrl: input.projectUrl,
      demoUrl: input.demoUrl ?? null,
      tags: input.tags ?? [],
      imageBase64,
      createdAt: new Date().toISOString(),
    },
    adminToken,
  );
}

export async function addCert(
  input: CertSubmission,
  adminToken: string,
): Promise<void> {
  const slug = sanitizeSlug(input.slug || input.name);
  const imageBase64 = await resizeImageToBase64(input.imageFile);

  await dispatchCmsEvent(
    "add-cert",
    {
      id: input.id ?? slug,
      slug,
      name: input.name,
      issuer: input.issuer,
      issueDate: input.issueDate,
      credentialUrl: input.credentialUrl ?? null,
      imageBase64,
      pdfBase64: input.pdfFile ? await fileToBase64(input.pdfFile) : null,
      createdAt: new Date().toISOString(),
    },
    adminToken,
  );
}
