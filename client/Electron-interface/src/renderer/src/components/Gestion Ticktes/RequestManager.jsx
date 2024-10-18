import React, { useState } from 'react';
import RequestList from './RequestList';
import RequestDetails from './RequestList';


import { Grid, Typography, Box } from '@mui/material';


const RequestsManager = () => {
  const [selectedRequest, setSelectedRequest] = useState(null);

  const handleSelectRequest = (request) => {
    setSelectedRequest(request);
  };

  return (
    
     

      <div className='flex  items-center '>
        
          <RequestList onSelectRequest={handleSelectRequest} />
        
          
        
      </div>
    
  );
};

export default RequestsManager;

