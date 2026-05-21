import 'server-only';
import { randomUUID } from 'node:crypto';

/**
 * 인증 서류 업로드용 presigned URL 발급 (privacy-design §2-4).
 * 서버는 메타만 받고, 클라이언트가 presigned PUT으로 S3에 직접 업로드 → KMS(SSE-KMS) 암호화 저장.
 *
 * Phase 3: AWS 자격증명(S3_BUCKET_VERIFICATION_DOCS, KMS_KEY_ID) 미설정 시 **mock**.
 * 실제 발급은 자격증명 설정 + @aws-sdk/* 설치 후 아래 TODO 블록을 활성화한다.
 */
export interface PresignResult {
  /** S3 객체 키 (DB에 저장, 평문 URL 보관 금지) */
  key: string;
  /** 클라이언트가 PUT 할 URL (mock 시 빈 문자열) */
  uploadUrl: string;
  /** SSE-KMS 적용 여부 */
  encrypted: boolean;
  mock: boolean;
}

export async function presignVerificationUpload(args: {
  userId: string;
  type: string;
  filename: string;
  contentType: string;
}): Promise<PresignResult> {
  const ext = args.filename.split('.').pop() ?? 'bin';
  const key = `verification/${args.userId}/${args.type}/${randomUUID()}.${ext}`;

  const bucket = process.env.S3_BUCKET_VERIFICATION_DOCS;
  const kmsKeyId = process.env.KMS_KEY_ID;

  if (!bucket || !kmsKeyId) {
    // 자격증명 미설정 → mock (개발/CI). 실제 업로드는 발생하지 않음.
    return { key, uploadUrl: '', encrypted: false, mock: true };
  }

  // TODO(자격증명 설정 후 활성화):
  // const { S3Client, PutObjectCommand } = await import('@aws-sdk/client-s3');
  // const { getSignedUrl } = await import('@aws-sdk/s3-request-presigner');
  // const client = new S3Client({ region: process.env.AWS_REGION });
  // const cmd = new PutObjectCommand({
  //   Bucket: bucket,
  //   Key: key,
  //   ContentType: args.contentType,
  //   ServerSideEncryption: 'aws:kms',
  //   SSEKMSKeyId: kmsKeyId,
  // });
  // const uploadUrl = await getSignedUrl(client, cmd, { expiresIn: 300 });
  // return { key, uploadUrl, encrypted: true, mock: false };

  return { key, uploadUrl: '', encrypted: true, mock: true };
}
