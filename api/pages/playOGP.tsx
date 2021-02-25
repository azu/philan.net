import { OGPTemplate } from "../components/OGPTemplate";
import { useRouter } from "next/router";

const OGCPage = () => {
    const router = useRouter();
    const { userName, balance, budget, used } = router.query;
    return (
        <OGPTemplate
            userName={userName as string}
            balance={balance as string}
            budget={budget as string}
            used={used as string}
        />
    );
};
export default OGCPage;
