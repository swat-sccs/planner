export default async function Page({
  params,
}: {
  params: Promise<{ profuid: string }>;
}) {
  const slug = (await params).profuid;
  return <div> {slug}</div>;
}
