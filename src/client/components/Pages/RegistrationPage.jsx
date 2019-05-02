/* eslint-disable no-useless-escape */
/* eslint-disable max-len */
/* eslint-disable react/no-unused-prop-types */
/* @flow
 * provendocs
 * Copyright (C) 2019  Southbank Software Ltd.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
 *
 * @Author: Michael Harrison
 * @Date:   2019-03-29T10:46:51+11:00
 * @Last modified by:   Michael Harrison
 * @Last modified time: 2019-04-03T09:18:20+11:00
 */

import React from 'react';
import { withRouter, Redirect } from 'react-router';
import {
  Register,
  RegisterSuccess,
  RegisterFailed,
  EmailSignup,
  EmailSignupSuccess,
  EmailConfirmed,
  EmailResend,
  EmailResendSuccess,
  EnterRefferalCode,
} from '../Register';
import { TopNavBar, Footer } from '../index';
import { PAGES } from '../../common/constants';
import { checkAuthentication } from '../../common/authentication';
import { api, Log } from '../../common';
// $FlowFixMe
import './LoginSignup.scss';
import { Loading } from '../Common';
import { openNotificationWithIcon } from '../../common/util';

type State = {
  loggedIn: boolean;
  hasReferralToken: boolean;
  isReferralRequired: boolean;
  loading: boolean;
};
type Props = {
  signedUp: boolean;
  eulaIsOpen: boolean;
  securityIsOpen: boolean;
  signUpFailed: boolean;
  history: any;
  location: any;
  match: any;
};
class RegisterationPage extends React.Component<Props, State> {
  constructor() {
    super();
    this.state = {
      loggedIn: false,
      hasReferralToken: false,
      isReferralRequired: true,
      loading: true,
    };
  }

  componentWillMount() {
    Log.setSource('RegistrationPage');
    const { loggedIn } = this.state;
    checkAuthentication()
      .then((response: Object) => {
        if (response.status === 200 && loggedIn !== true) {
          this.setState({ loggedIn: true });
        } else if (response.response.status === 400 && loggedIn !== false) {
          this.setState({ loggedIn: false });
        }
      })
      .catch((err) => {
        if (err.response.status === 400 && loggedIn !== false) {
          // Invalid Token, log in again.
          this.setState({ loggedIn: false });
        }
      });

    // Check if referral code is needed:
    console.log('Checking if Referrel code is required...');
    api
      .isReferralRequired()
      .then((result) => {
        console.log('Is Refferel code required: ', result);
        if (result.data.referralRequired) {
          this.setState({ isReferralRequired: true });
          // Check if they have a refferal token.
          const token = localStorage.getItem('provendocs_referral_code');
          if (token) {
            let count = 0;
            const checkGrowsurfInterval = setInterval(() => {
              console.log('Checking Growsurf is initialized: ', count, ' / 20');
              if (window && window.growsurf && window.growsurf.getParticipantById) {
                console.log('Growsurf avaliable');
                window.growsurf
                  .getParticipantById(token)
                  .then((res) => {
                    console.log('Got Growsurf Participant.');
                    if (!res) {
                      this.setState({ hasReferralToken: false });
                      this.setState({ loading: false });
                    } else {
                      this.setState({ hasReferralToken: true });
                      this.setState({ loading: false });
                    }
                  })
                  .catch((getParticipantErr) => {
                    Log.error(getParticipantErr);
                    this.setState({ hasReferralToken: false });
                    this.setState({ loading: false });
                  });
                clearInterval(checkGrowsurfInterval);
              } else {
                if (count === 5) {
                  console.error(
                    'Failed to validate referrel participant in 5000ms, triggering load window event....',
                  );
                  const evt = document.createEvent('Event');
                  evt.initEvent('load', false, false);
                  window.dispatchEvent(evt);
                } else if (count === 10) {
                  console.error(
                    'Failed to validate referrel participant in 10000ms, triggering load window event....',
                  );
                  const evt = document.createEvent('Event');
                  evt.initEvent('load', false, false);
                  window.dispatchEvent(evt);
                } else if (count === 15) {
                  console.error(
                    'Failed to validate referrel participant in 15000ms, triggering load window event....',
                  );
                  const evt = document.createEvent('Event');
                  evt.initEvent('load', false, false);
                  window.dispatchEvent(evt);
                } else if (count > 20) {
                  console.error('Failed to validate referrel participant in 20000ms, Giving up :(');
                  clearInterval(checkGrowsurfInterval);
                }
                count += 1;
              }
            }, 1000);
          } else {
            this.setState({ hasReferralToken: true });
            this.setState({ loading: false });
          }
        } else {
          this.setState({ isReferralRequired: false });
          this.setState({ loading: false });
        }
      })
      .catch((isRefRequiredErr) => {
        console.error('IsRefRequired Err: ', isRefRequiredErr);
        this.setState({ isReferralRequired: true });
        // Check if they have a refferal token.
        const token = localStorage.getItem('provendocs_referral_code');
        if (token) {
          let count = 0;
          const checkGrowsurfInterval = setInterval(() => {
            count += 1;
            if (count > 20) {
              console.error(
                'Failed to validate referrel participant in 20000ms, please contact support.',
              );
              openNotificationWithIcon(
                'error',
                'Failed to check refferal.',
                'Sorry, we were unable to validate your referral link in a timely manor, please make sure you have navigated here via a referral link or contact support.',
              );
              clearInterval(checkGrowsurfInterval);
              this.setState({ loading: false });
              this.setState({ hasReferralToken: false });
            }
            if (window && window.growsurf && window.growsurf.getParticipantById) {
              console.log('Growsurf initialized, checking participant ID.');
              window.growsurf
                .getParticipantById(token)
                .then((res) => {
                  console.log('Got Growsurf Participant.');
                  if (!res) {
                    this.setState({ hasReferralToken: false });
                    this.setState({ loading: false });
                  } else {
                    this.setState({ hasReferralToken: true });
                    this.setState({ loading: false });
                  }
                })
                .catch((getParticipantErr) => {
                  Log.error(getParticipantErr);
                  this.setState({ hasReferralToken: false });
                  this.setState({ loading: false });
                });
              clearInterval(checkGrowsurfInterval);
            } else {
              console.log('Waiting for GrowSurf, wait counter: ', count, ' / 20');
            }
          }, 1000);
        } else {
          this.setState({ hasReferralToken: false });
          this.setState({ loading: false });
        }
      });
  }

  componentDidMount() {
    const { history } = this.props;
    if (this.detectMobile()) {
      history.replace('/mobile');
    }
  }

  componentWillReceiveProps() {}

  detectMobile = () => {
    const browser = navigator.userAgent || navigator.vendor || window.opera;
    let check = false;
    if (
      /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(
        browser,
      )
      || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(
        browser.substr(0, 4),
      )
    ) check = true;
    return check;
  };

  handleLogoClick = () => {
    const { history } = this.props;
    history.push('/');
  };

  render() {
    const {
      location: { pathname },
      match: { path },
      signedUp,
      signUpFailed,
    } = this.props;
    const {
      loggedIn, hasReferralToken, isReferralRequired, loading,
    } = this.state;
    let page = 'default';
    const pagePath = pathname.replace(path, '').replace(/\//g, '');
    if (pagePath !== '') {
      page = pagePath;
    }
    if (signedUp || signUpFailed) {
      page = 'none';
    }
    if (!hasReferralToken && isReferralRequired) {
      page = 'noReferralToken';
    }
    if (loggedIn) {
      return <Redirect to="/dashboard" />;
    }

    if (loading) {
      return (
        <div className="App">
          <TopNavBar currentPage={PAGES.REGISTER} isAuthenticated={loggedIn} />
          <div className="AppBody">
            <div className="mainPanel">
              <div className="loginSignupRoot">
                <Loading isFullScreen={false} />
              </div>
            </div>
          </div>
          <Footer currentPage={PAGES.HOME} privacyOpen={false} />
        </div>
      );
    }

    return (
      <div className="App">
        <TopNavBar currentPage={PAGES.REGISTER} isAuthenticated={loggedIn} />
        <div className="AppBody">
          <div className="mainPanel">
            <div className="loginSignupRoot">
              {signedUp && <RegisterSuccess />}
              {signUpFailed && <RegisterFailed />}
              {page === 'default' && <Register pageProps={this.props} />}
              {page === 'email' && <EmailSignup />}
              {page === 'emailSuccess' && <EmailSignupSuccess />}
              {page === 'emailConfirm' && <EmailConfirmed />}
              {page === 'emailResend' && <EmailResend />}
              {page === 'emailResendSuccess' && <EmailResendSuccess />}
              {page === 'noReferralToken' && <EnterRefferalCode />}
            </div>
          </div>
        </div>
        <Footer currentPage={PAGES.HOME} privacyOpen={false} />
      </div>
    );
  }
}

export default withRouter(RegisterationPage);
