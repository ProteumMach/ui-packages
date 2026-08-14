export interface UploadToPresignedUrlOptions {
  fetch?: typeof globalThis.fetch
}

/** Upload content to the URL returned by the Engine API's create-part operation. */
export const uploadToPresignedUrl = async (
  uploadUrl: string,
  content: BodyInit,
  { fetch = globalThis.fetch }: UploadToPresignedUrlOptions = {},
): Promise<void> => {
  let response: Response
  try {
    response = await fetch(uploadUrl, { method: 'PUT', body: content })
  } catch (cause) {
    throw new Error('Could not upload the part to the presigned URL', { cause })
  }

  if (!response.ok) {
    throw new Error(`Could not upload the part to the presigned URL: HTTP ${response.status}`)
  }
}
