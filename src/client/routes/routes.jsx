/*
 * @Author: Michael Harrison
 * @Date:   2018-11-23T15:00:28+11:00
 * @Last modified by:   wahaj
 * @Last modified time: 2019-03-27T15:21:11+11:00
 */

// eslint no-return-assign:0
import React from 'react';
import { Route, Switch } from 'react-router-dom';
import NotFound from '../components/Pages/Status/404';
import {
  // SharedDocument,
  // Dashboard,
  // HomePage,
  // RegistrationPage,
  // LoginPage,
  LandingPage,
} from '../components/Pages';
import '../style/global_styles.scss';

const Routes = () => (
  <Switch>
    <Route exact path="/" component={LandingPage} />
    <Route path="/landing" component={LandingPage} />
    <Route path="/landing/:page" component={LandingPage} />
    {/* <Route path="/dashboard/" component={Dashboard} />
    <Route path="/home/" component={HomePage} />
    <Route path="/privacy" component={() => <HomePage privacyOpen />} />
    <Route path="/eula" component={() => <RegistrationPage eulaOpen />} />
    <Route path="/security" component={() => <RegistrationPage securityOpen />} />
    <Route path="/share/:link" component={SharedDocument} />
    <Route path="/login" component={LoginPage} />
    <Route path="/login/:page" component={LoginPage} />
    <Route exact path="/loginFailed" component={() => <LoginPage failedLogin />} />
    <Route path="/signup" component={RegistrationPage} />
    <Route path="/signup/:page" component={RegistrationPage} />
    <Route exact path="/signupFailed" component={() => <RegistrationPage signUpFailed />} />
    <Route exact path="/signupSuccess" component={() => <LoginPage signedUp />} /> */}
    <Route path="*" component={NotFound} />
  </Switch>
);
export default Routes;
