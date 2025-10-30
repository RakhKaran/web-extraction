import { Helmet } from "react-helmet-async";
import { ReactFlowView } from "src/sections/reactFlow/view";



export default function ReactFlowPage(){
    return(
        <>
            <Helmet>
                <title>Extraction flow</title>
            </Helmet>

           <ReactFlowView/>
          
        </>
    )
}