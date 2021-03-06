/*
 * @flow
 * Created Date: Saturday September 29th 2018
 * Author: Michael Harrison
 * Last Modified: Tuesday October 9th 2018 9:54:52 am
 * Modified By: Michael Harrison at <Mike@Southbanksoftware.com>
 */
import React from 'react';
import Markdown from 'react-markdown';
import CalenderIcon from '../../style/icons/pages/landing-page/calender-icon.svg';
import MailIcon from '../../style/icons/pages/landing-page/mail-icon.svg';
import UserIcon from '../../style/icons/pages/landing-page/user-icon.svg';
// $FlowFixMe
import './Privacy.scss';
// $FlowFixMe
import PrivacyDoc from './Policy.md';

type State = {
  markdown: string;
};

type Props = {};

class Privacy extends React.Component<Props, State> {
  constructor() {
    super();
    this.state = {
      markdown: '',
    };
  }

  componentDidMount() {
    this.setState({ markdown: PrivacyDoc });
  }

  render() {
    const { markdown } = this.state;
    return (
      <div className="content">
        <div className="contentTop">
          <div className="left">
            <span className="title">Privacy Policy</span>
            <span className="subtitle">ProvenDB and ProvenDocs.</span>
            <span className="text">
              This privacy policy relates the websites provendocs.com, provendb.com and and to the
              products “ProvenDB” and “ProvenDocs” which is made licensed by Southbank Software
              under the Affero General Public License (AGPL) license.
              <br />
              <br />
              This privacy policy has been compiled to better serve those who are concerned with how
              their ‘Personally Identifiable Information’ (PII) is being used online. PII, as
              described in US privacy law and information security, is information that can be used
              on its own or with other information to identify, contact, or locate a single person,
              or to identify an individual in context. Please read our privacy policy carefully to
              get a clear understanding of how we collect, use, protect or otherwise handle your
              Personally Identifiable Information on our website and within the ProvenDB and
              ProvenDocs products.
            </span>
          </div>
          <div className="right">
            <span className="title one">Contacting Us</span>
            <span className="text one">
              If there are any questions regarding this privacy policy, you may contact us using the
              information below.
            </span>
            <span className="title two">Southbank Software</span>
            <span className="text two">Level 3, 20 Queen St Melbourne, VIC 3000</span>
            <div className="grid">
              <div className="row">
                <CalenderIcon />
                <span className="label">July 16th 2018 (last edited)</span>
              </div>
              <div className="row">
                <MailIcon />
                <span className="label">admin@southbanksoftware.com</span>
              </div>
              <div className="row">
                <UserIcon />
                <span className="label">Guy Harrison, CTO Southbank Software</span>
              </div>
            </div>
          </div>
        </div>
        <div className="contentBottom">
          <Markdown source={markdown} />
;
        </div>
      </div>
    );
  }
}

export default Privacy;
