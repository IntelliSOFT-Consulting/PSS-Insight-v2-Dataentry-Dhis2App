import React from 'react';
import { Link, Routes, Route } from 'react-router-dom';
import { Menu, MenuItem } from '@dhis2/ui';
import classes from '../App.module.css';
import Surveys from '../Pages/Surveys';
import NewResponse from '../Pages/NewResponse';
import { getOrgUnits } from '../api/api';

export default function Layout({ user }) {
  const [orgUnits, setOrgUnits] = React.useState([]);
  const [currentOrgUnit, setCurrentOrgUnit] = React.useState(null);

  React.useEffect(() => {
    getOrgUnits(user).then(res => {
      setOrgUnits(res?.details);
      setCurrentOrgUnit(res?.details[0]);
    });
  }, [user]);

  return (
    <main
      style={{
        display: 'flex',
        minHeight: 'calc(100vh - 48px)',
        height: '100%',
      }}
    >
      <aside className={classes.sidebar}>
        <Menu>
          <Link to='/' className={classes.sidebarHeader}>
            <MenuItem label='Dashboard' />
          </Link>

          <p
            style={{
              background: '#005A8E46',
              margin: 0,
              padding: 16,
              marginBottom: 0,
              fontSize: 14,
              width: 270,
            }}
          >
            Data Entry Menu
          </p>

          <Link to='/'>
            <MenuItem label='My Submissions' />
          </Link>
          <Link to='/create'>
            <MenuItem label='Enter Data' />
          </Link>

          <p
            style={{
              background: '#005A8E46',
              margin: 0,
              padding: 16,
              marginBottom: 0,
              fontSize: 14,
              width: 270,
              marginTop: 16,
            }}
          >
            Organization Unit
          </p>
          {orgUnits.map(orgUnit => (
            <div
              key={orgUnit.displayName}
              onClick={() => setCurrentOrgUnit(orgUnit)}
              className={
                currentOrgUnit?.displayName === orgUnit.displayName
                  ? classes.active
                  : ''
              }
            >
              <MenuItem label={orgUnit.displayName} />
            </div>
          ))}
        </Menu>
      </aside>
      <section
        style={{
          backgroundColor: '#F4F6F8',
          flexGrow: 1,
          padding: 20,
        }}
      >
        <Routes>
          <Route path='/' element={<Surveys user={user} />} />
          <Route
            path='/create'
            element={<NewResponse user={user} orgUnit={currentOrgUnit} />}
          />
          <Route path='/view/:id' element={<NewResponse user={user} />} />
          <Route path='/edit/:id' element={<NewResponse user={user} />} />
          <Route path='/*' element={<Surveys user={user} />} />
        </Routes>
      </section>
    </main>
  );
}
