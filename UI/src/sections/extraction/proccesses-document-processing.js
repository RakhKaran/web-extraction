import { Box, Button, Container, Stack, Typography } from "@mui/material"

const options = [
    {title: 'Image Processing', subtitle: 'Optimize images for analysis.', icon: '/assets/icons/document-process/process.svg'},
    {title: 'Image Processing', subtitle: 'Optimize images for analysis.', icon: '/assets/icon/process.svg'},
    {title: 'Image Processing', subtitle: 'Optimize images for analysis.', icon: '/assets/icon/process.svg'},
    {title: 'Image Processing', subtitle: 'Optimize images for analysis.', icon: '/assets/icon/process.svg'},
    {title: 'Image Processing', subtitle: 'Optimize images for analysis.', icon: '/assets/icon/process.svg'},
    {title: 'Image Processing', subtitle: 'Optimize images for analysis.', icon: '/assets/icon/process.svg'},
    {title: 'Image Processing', subtitle: 'Optimize images for analysis.', icon: '/assets/icon/process.svg'},
    {title: 'Image Processing', subtitle: 'Optimize images for analysis.', icon: '/assets/icon/process.svg'},
    {title: 'Image Processing', subtitle: 'Optimize images for analysis.', icon: '/assets/icon/process.svg'},
    {title: 'Image Processing', subtitle: 'Optimize images for analysis.', icon: '/assets/icon/process.svg'},

]
export default function DocumentProcess(){
    return(
        <>
            <Box sx={{ mt: 6, display: 'flex', justifyContent: 'left' }}>
                {/* progress line box */}
                <Box
                    sx={{
                    width: 250,
                    height: 250,
                    borderRadius: '50%',
                    border: '5px solid #2DCA73',
                    borderRight: '5px solid white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transform: 'rotate(45deg)',
                    }}
                >
                    {/* outer circle box */}
                    <Box
                        sx={{
                            margin: '10px',
                            width: 180,
                            height: 180,
                            borderRadius: '50%',
                            border: '2px solid white',
                            boxShadow: '0 8px 12px rgba(0, 0, 0, 0.3)', // outer drop shadow
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transform: 'rotate(-45deg)',
                        }}
                    >
                    {/* innner circle box */}
                    <Box
                        sx={{
                        width: 170,
                        height: 170,
                        borderRadius: '50%',
                        backgroundColor: 'rgba(136, 136, 136, 0.07)', // 7% opacity
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 'bold',
                        color: '#fff',
                        }}
                    >
                        {/* image box */}
                        <Box
                            component='img'
                            src="/assets/icons/document-process/ignestion.svg"
                            alt='document-proccess'
                        />  
                    </Box>
                    </Box>
                </Box>

                {/* new Box */}
                {/* progress line box */}
                <Box
                    sx={{
                    width: 250,
                    height: 250,
                    borderRadius: '50%',
                    border: '5px dashed lightgray',
                    borderLeft: '5px solid #F6ABD8',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transform: 'rotate(-45deg)',
                    }}
                >
                    {/* outer circle box */}
                    <Box
                        sx={{
                            margin: '10px',
                            width: 180,
                            height: 180,
                            borderRadius: '50%',
                            border: '2px solid white',
                            boxShadow: '0 8px 12px rgba(0, 0, 0, 0.3)', // outer drop shadow
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transform: 'rotate(45deg)',
                        }}
                    >
                    {/* innner circle box */}
                    <Box
                        sx={{
                        width: 170,
                        height: 170,
                        borderRadius: '50%',
                        backgroundColor: 'rgba(136, 136, 136, 0.07)', // 7% opacity
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 'bold',
                        color: '#fff',
                        }}
                    >
                        {/* image box */}
                        <Box
                            component='img'
                            src="/assets/icons/document-process/add.svg"
                            alt='document-proccess'
                        />  
                    </Box>
                    </Box>
                </Box>
            </Box>

            <Stack sx={{marginTop: 3}} spacing={1}>
                <Typography variant='h5'>1. Ingestion</Typography>
                <Typography variant='h6'>FTP</Typography>
                <Typography variant='body2'>ftp://ftp.mydomain.com/doc</Typography>
                <Button sx={{width: '200px', color: 'royalBlue', borderColor: 'royalBlue'}} variant='outlined'>Add Channel</Button>
            </Stack>
        </>
    )
}