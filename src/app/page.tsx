import Swagger from "@/components/Swagger";
import { getApiDocs } from "@/lib/utils/swagger";

export default async function Home() {
  const spec = await getApiDocs();

  return (
    <>
      <Swagger spec={spec} />
    </>
  );
}
