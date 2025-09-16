import { settings } from "nprogress";
// MUI
import { Box, Container, IconButton, Typography } from "@mui/material";
// components
import CustomBreadcrumbs from "src/components/custom-breadcrumbs";
import Iconify from "src/components/iconify";
import { paths } from "src/routes/paths";
import DocumentProcess from "../proccesses-document-processing";

export default function IntelligentDocumentProcessing(){
    return(
        <Container maxWidth={settings.themeStretch ? false : 'lg'}>
            <CustomBreadcrumbs
                heading="Intelligent Document Processing"
                links={[]}
                // sx={{
                // mb: { xs: 1, md: 1 },
                // }}
            />
            <Box component='div' sx={{display: 'flex', alignItems: 'center', gap: '10px'}}>
                <IconButton sx={{paddingLeft: '0px'}}>
                    <Iconify color='#292D32' icon="mdi:keyboard-backspace" width={24} />
                </IconButton>
                <Typography sx={{fontWeight: 'normal'}} variant="h5">Define Process Flow</Typography>
            </Box>

            <DocumentProcess />
        </Container>
    )
}