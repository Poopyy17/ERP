import React, { useContext } from 'react'
import { Navigate } from 'react-router-dom';
import { Store } from '../Store';

export default function InspectorRoute({children}) {

  const { state } = useContext(Store);
  const { userInfo } = state;

  return userInfo && userInfo.isInspector ? children : <Navigate to='/signin' />
  
}
