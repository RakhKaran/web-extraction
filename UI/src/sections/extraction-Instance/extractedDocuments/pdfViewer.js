import { Box, IconButton, Typography } from '@mui/material';
import PropTypes from 'prop-types';
import { useState, useRef, useEffect } from 'react';
// eslint-disable-next-line import/no-extraneous-dependencies
import { Document, Page, pdfjs } from 'react-pdf';
import Iconify from 'src/components/iconify';

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

export default function PdfViewer({ docUrl }) {
  const [noOfPages, setNoOfPages] = useState();
  const [pageNumber, setPageNumber] = useState(1);
  const [containerWidth, setContainerWidth] = useState(null);
  const containerRef = useRef();

  function onDocumentLoadSuccess({ numPages }) {
    setNoOfPages(numPages);
  }

  useEffect(() => {
    if (containerRef.current) {
      setContainerWidth(containerRef.current.offsetWidth);
    }
    const handleResize = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.offsetWidth);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const goToPrevPage = () => {
    setPageNumber(prev => Math.max(prev - 1, 1));
  };

  const goToNextPage = () => {
    setPageNumber(prev => Math.min(prev + 1, noOfPages));
  };

  return (
    <div ref={containerRef} style={{ width: '100%' }}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'end',
          alignItems: 'center',
          gap: 2,
          my: 2,
        }}
      >
        <IconButton
          onClick={goToPrevPage}
          disabled={pageNumber <= 1}
          color="primary"
        >
          <Iconify icon="mdi:chevron-left" width={24} height={24} />
        </IconButton>

        <Typography variant="body1">
          Page {pageNumber} of {noOfPages || '?'}
        </Typography>

        <IconButton
          onClick={goToNextPage}
          disabled={pageNumber >= noOfPages}
          color="primary"
        >
          <Iconify icon="mdi:chevron-right" width={24} height={24} />
        </IconButton>
      </Box>

      {/* eslint-disable-next-line react/jsx-no-bind */}
      <Document file={docUrl} onLoadSuccess={onDocumentLoadSuccess}>
        {containerWidth && (
          <Page pageNumber={pageNumber} width={containerWidth} />
        )}
      </Document>
    </div>
  );
}

PdfViewer.propTypes = {
  docUrl: PropTypes.string.isRequired,
};
