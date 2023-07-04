import React from "react";
import { Link, Routes, Route } from "react-router-dom";
import { Menu, MenuItem } from "@dhis2/ui";
import classes from "../App.module.css";
import Surveys from "../Pages/Surveys";
import NewResponse from "../Pages/NewResponse";
import { getOrgUnit } from "../api/api";

export default function Layout({ user }) {
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
            <MenuItem label={`Dashboard (${user?.me?.organisationUnits[0]?.name})`} />
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
          {user?.me?.organisationUnits?.map(orgUnit => (
            <div key={orgUnit.name} className={classes.active}>
              <MenuItem label={orgUnit.name} />
            </div>
          ))}
        </Menu>
      </aside>
      <section
        style={{
          backgroundColor: '#F4F6F8',
          flexGrow: 1,
          padding: 20,
          marginLeft: '270px',
        }}
      >
        <Routes>
          <Route path='/' element={<Surveys user={user} />} />
          <Route path='/create' element={<NewResponse user={user} />} />
          <Route path='/view/:id' element={<NewResponse user={user} />} />
          <Route path='/edit/:id' element={<NewResponse user={user} />} />
          <Route path='/*' element={<Surveys user={user} />} />
        </Routes>
      </section>
    </main>
  );
}
