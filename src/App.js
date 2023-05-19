import React from 'react';
import { DataQuery } from '@dhis2/app-runtime';
import './custom.css';
import Layout from './Layouts/Layout';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';

const query = {
  me: {
    resource: 'me',
    params: {
      fields:
        'id,displayName,email,firstName,surname,username,organisationUnits[id,name]',
    },
  },
};

const MyApp = () => (
  <div>
    <Router>
      <DataQuery query={query}>
        {({ error, loading, data }) => {
          if (error) return <span>ERROR</span>;
          if (loading) return <span>...</span>;
          return (
            <Routes>
              <Route path='/*' element={<Layout user={data} />} />
            </Routes>
          );
        }}
      </DataQuery>
    </Router>
  </div>
);

export default MyApp;
