import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  List,
  ListItem,
  ListItemButton,
  ListItemAvatar,
  Avatar,
  ListItemText
} from '@mui/material';
import PropTypes from 'prop-types';

const operations = [
  {
    id: 1,
    title: 'Locate',
    description: 'Sort documents by type.',
    icon: '/assets/icons/document-process/classify.svg',
    type: 'locate',
    color: '#0AAFFF'
  },
  {
    id: 2,
    title: 'Search',
    description: 'Pull key data from documents.',
    icon: '/assets/icons/document-process/extract.svg',
    type: 'search',
    color: '#FFC113'
  },
  {
    id: 3,
    title: 'Transformation',
    description: 'Pull key data from documents.',
    icon: '/assets/icons/document-process/validate.svg',
    type: 'transformation',
    color: '#ED63D2'
  },
  {
    id: 4,
    title: 'Deliver',
    description: 'Send documents or data.',
    icon: '/assets/icons/document-process/deliver.svg',
    type: 'deliver',
    color: '#7551E9'
  },
];

export default function OperationSelectorModal({ onSelect, onClose, open, bluePrintNode }) {
  const [data, setData] = useState([]);

  useEffect(() => {
    const newData = operations.filter((opt) => !bluePrintNode?.includes(opt.title));
    setData(newData);
  }, [bluePrintNode, open])

  console.log('nodes already present', bluePrintNode)

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Select a Node</DialogTitle>
      <DialogContent dividers>
        <List>
          {data.map((operation) => (
            <ListItem key={operation.id} disablePadding sx={{ borderBottom: '1px solid lightgray' }}>
              <ListItemButton onClick={() => onSelect(operation)}>
                <ListItemAvatar>
                  <Avatar
                    src={operation.icon}
                    alt={operation.title}
                    sx={{ width: 32, height: 32 }}
                  />
                </ListItemAvatar>
                <ListItemText primary={operation.title} secondary={operation.description} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="error">Cancel</Button>
      </DialogActions>
    </Dialog>
  );
}

OperationSelectorModal.propTypes = {
  onSelect: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  open: PropTypes.bool.isRequired,
  bluePrintNode: PropTypes.array,
};
