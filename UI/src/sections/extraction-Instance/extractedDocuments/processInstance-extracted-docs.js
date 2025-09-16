import React, { useEffect, useState } from "react";
import PropTypes from "prop-types"
import { Box, Card, CardContent, Chip, Grid, IconButton, Stack, Typography } from "@mui/material";
import { m, AnimatePresence } from "framer-motion";
import Iconify from "src/components/iconify";
import PdfViewer from "./pdfViewer";
import UpdateExtractedFieldsModal from "./updateExtractedField";

export default function ProcessInstanceExtractedDocuments({ currentDocs }) {
    const [isOpen, setIsOpen] = useState(false);
    const [documentsData, setDocumentsData] = useState([]);
    const [selectedDocumentId, setSelectedDocumentId] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (currentDocs && currentDocs.success && currentDocs.data.length > 0) {
            setDocumentsData(currentDocs.data);
            setSelectedDocumentId(currentDocs?.data[0]);
        }
        setIsLoading(false);
    }, [currentDocs]);

    const handleOpenModal = () => {
        setIsOpen(true);
    }

    const handleCloseModal = () => {
        setIsOpen(false);
    }


    return (
        <Grid container spacing={1}>
            <Grid item xs={12} md={6}>
                <Stack spacing={1} direction='column'>
                    {documentsData.length > 0 ? documentsData.map((doc) => (
                        <Card
                            key={doc.id}
                            onClick={() => setSelectedDocumentId(doc)}
                            sx={{
                                border: selectedDocumentId?.id === doc.id ? '2px solid royalBlue' : '1px solid #e0e0e0',
                                borderRadius: 3,
                                boxShadow: 2,
                                p: 1,
                                transition: 'border 0.3s ease',
                                cursor: 'pointer',
                                '&:hover': {
                                    borderColor: 'royalBlue',
                                },
                            }}
                        >
                            <CardContent>
                                {doc?.isHumanUpdated && (
                                    <Box component='div' sx={{ width: '100%', display: 'flex', justifyContent: 'flex-end', mb: 1 }}>
                                        <Chip
                                            label="Human Updated"
                                            color="success"
                                            variant="filled"
                                            size="small"
                                            sx={{
                                                alignSelf: 'flex-end',
                                            }}
                                        />
                                    </Box>
                                )}
                                <Stack spacing={2}>
                                    {/* Document Name & Type */}
                                    <Box>
                                        <Typography variant='h6' color="primary" fontWeight="bold">
                                            {doc?.documentDetails?.documentName || 'Untitled Document'}
                                        </Typography>
                                        <Typography variant='subtitle1' color="text.secondary">
                                            {doc?.documentDetails?.documentType || 'Unknown Type'}
                                        </Typography>
                                    </Box>

                                    {/* Extracted Fields */}
                                    <Box>
                                        <Box
                                            sx={{
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center',
                                            }}
                                        >
                                            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                                                Extracted Fields
                                            </Typography>

                                            <Box component='div' sx={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                {selectedDocumentId?.id !== doc?.id && (<Typography variant="subtitle1" sx={{ color: 'royalBlue' }}>
                                                    View
                                                </Typography>)}
                                                <IconButton
                                                    sx={{
                                                        // backgroundColor: 'rgba(65, 130, 235, 0.1)',
                                                        // border: '1px solid rgba(65, 130, 235, 0.3)',
                                                        // p: 1,
                                                        // borderRadius: '12px',
                                                        color: '#4182EB', // icon color
                                                    }}
                                                    onClick={() => handleOpenModal()}
                                                >
                                                    <Iconify icon="solar:pen-bold" width={20} height={20} />
                                                </IconButton>
                                            </Box>
                                        </Box>

                                        <Box component='div' xs={{ mb: 2 }}>
                                            <Typography variant="body1" color="text.secondary">
                                                Overall Score: <span style={{ color: 'royalblue' }}>{doc?.overAllScore || 'NA'}</span>
                                            </Typography>
                                        </Box>

                                        <AnimatePresence initial={false}>
                                            {selectedDocumentId?.id === doc.id && (
                                                <m.div
                                                    initial={{ opacity: 0, height: 0 }}
                                                    animate={{ opacity: 1, height: 'auto' }}
                                                    exit={{ opacity: 0, height: 0 }}
                                                    transition={{ duration: 0.3 }}
                                                >
                                                    <Stack spacing={1} direction="column" sx={{ overflow: 'hidden' }}>
                                                        {doc?.extractedFields && doc?.extractedFields?.length > 0 ? (
                                                            doc?.extractedFields.map((field) => (
                                                                <Box key={field?.fieldValue}>
                                                                    <Box component='div' sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                                                        <Typography variant="caption" color="text.secondary">
                                                                            {field?.fieldName}
                                                                        </Typography>
                                                                        <Typography variant="caption" color="text.secondary">
                                                                            Score: <span style={{ color: 'royalblue' }}>{field?.fieldScore || 'NA'}</span>
                                                                        </Typography>
                                                                    </Box>
                                                                    <Typography variant="body2" color="text.primary">
                                                                        {field?.fieldValue}
                                                                    </Typography>
                                                                </Box>
                                                            ))
                                                        ) : (
                                                            <Typography variant="body2" color="text.secondary">
                                                                No fields extracted.
                                                            </Typography>
                                                        )}
                                                    </Stack>
                                                </m.div>
                                            )}
                                        </AnimatePresence>
                                    </Box>
                                </Stack>
                            </CardContent>
                        </Card>

                    )) : (
                        <Typography variant='body1'>No Documents</Typography>
                    )}
                </Stack>
            </Grid>
            <Grid item md={6}>
                {selectedDocumentId?.fileDetails?.fileUrl ? (
                    <Box
                        sx={{
                            width: '100%',
                            height: '600px', // Set desired height
                            overflow: 'auto',
                            border: '1px solid #ccc',
                            borderRadius: 2,
                            p: 1,
                            backgroundColor: '#f9f9f9'
                        }}
                    >
                        <PdfViewer docUrl={selectedDocumentId.fileDetails.fileUrl} />
                    </Box>
                ) : (
                    <Typography variant="h4">No Document</Typography>
                )}
            </Grid>

            {/* fields update modal */}
            <UpdateExtractedFieldsModal isOpen={isOpen} handleCloseModal={handleCloseModal} data={selectedDocumentId} setDocumentsData={setDocumentsData} />
        </Grid>
    )
}

ProcessInstanceExtractedDocuments.propTypes = {
    currentDocs: PropTypes.object,
}