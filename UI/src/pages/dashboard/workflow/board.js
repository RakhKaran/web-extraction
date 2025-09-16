import { Helmet } from "react-helmet-async";
import WorkFlowBoardView from "src/sections/workflow/view/work-flow-board-view";

export default function WorkFlowPage(){
    return(
        <>
            <Helmet>
                <title>Work flow</title>
            </Helmet>
            <WorkFlowBoardView />
        </>
    )
}