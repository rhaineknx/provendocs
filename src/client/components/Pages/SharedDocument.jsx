/*
 * @flow
 * Dashboard component, master component for web app.
 * @Author: Michael Harrison
 * @Date:   2018-10-29T20:03:41+11:00
 * @Last modified by:   Michael Harrison
 * @Last modified time: 2019-03-14T17:10:16+11:00
 */

import React from 'react';
import { withRouter } from 'react-router';
import autobind from 'autobind-decorator';
import Timestamp from 'react-timestamp';
import SplitPane from 'react-split-pane';
import { ExcelPreview, TopNavBar } from '../index';
import TickIcon from '../../style/icons/pages/dashboard/tick-icon.svg';
import CrossIcon from '../../style/icons/pages/dashboard/cross-icon.svg';
import DocumentIcon from '../../style/icons/pages/dashboard/document-icon.svg';
import BlockchainIcon from '../../style/icons/pages/dashboard/blockchain-icon.svg';
import HashIcon from '../../style/icons/pages/dashboard/hash-icon.svg';
import PendingIcon from '../../style/icons/pages/dashboard/uploading-icon.svg';
import InfoIcon from '../../style/icons/pages/dashboard/info-icon.svg';
import { PAGES, MIMETYPES, PROOF_STATUS } from '../../common/constants';
import { checkAuthentication } from '../../common/authentication';
import { Loading, Error } from '../Common';
import { convertBytes, openNotificationWithIcon } from '../../common/util';
import { api, Log } from '../../common';
// $FlowFixMe
import './Dashboard.scss';
// $FlowFixMe
import './SharedDocument.scss';

type Props = {
  history: any;
  match: any;
};
type State = {
  size: Object;
  filePreview: any;
  loading: boolean;
  proofLoading: boolean;
  fileName: string;
  proofDate: 'UNKNOWN';
  proof: Object;
  isAuthenticated: boolean;
  mimetype: any;
  fileId: any;
  metadata: any;
  emailExtras: any;
  fileSize: number;
};

class SharedDocument extends React.Component<Props, State> {
  constructor() {
    super();
    Log.setSource('SharedDocument');
    this.state = {
      size: { width: 400, height: 200 },
      loading: true,
      proofLoading: true,
      proof: {},
      fileName: 'UNKNOWN',
      fileSize: 0,
      proofDate: 'UNKNOWN',
      isAuthenticated: false,
      fileId: null,
      metadata: null,
      mimetype: null,
      filePreview: null,
      emailExtras: {},
    };
  }

  componentDidMount() {
    const { match, history } = this.props;
    const { params } = match;
    const { link } = params;
    window.addEventListener('resize', this._updateDimensions);
    // Check normal authentication.
    checkAuthentication()
      .then((response: any) => {
        if (response.status === 200) {
          // Check if user has shared access to this file,
          api
            .checkSharedAccess(link)
            .then((result) => {
              this.setState({ fileName: result.data.fileName });
              this.setState({ fileId: result.data.fileId });
              this.setState({ metadata: result.data.metaData });
              this.setState({ mimetype: result.data.mimetype });
              this.setState({ proofDate: result.data.proofDate });
              this.setState({ fileSize: result.data.size });

              api
                .getHistoricalProofInfoForUser(
                  result.data.fileName,
                  result.data.metaData.minVersion,
                )
                .then((proofResult) => {
                  this.setState({ proofLoading: false });
                  if (proofResult.data.ok === 1) {
                    this.setState({ proof: proofResult.data.proofs[0] });
                  }
                })
                .catch((err) => {
                  Log.error(`Failed to fetch proof with err: ${err}`);
                  openNotificationWithIcon(
                    'error',
                    'Error Getting Proof',
                    'Failed to fetch proof for this document, sorry!',
                  );
                });
              if (result.data.mimetype !== MIMETYPES.PDF) {
                // Can't display in IFRAME, therefore fetch a preview.
                this._fetchFilePreview(
                  result.data.fileName,
                  result.data.metaData.minVersion,
                  result.data.fileId,
                )
                  .then((fetchPreviewResult) => {
                    if (result.data.mimetype === MIMETYPES.EMAIL) {
                      if (
                        fetchPreviewResult.data.subject
                        || fetchPreviewResult.data.from
                        || fetchPreviewResult.data.to
                      ) {
                        const {
                          to, from, cc, subject, attachments,
                        } = fetchPreviewResult.data;
                        this.setState({
                          emailExtras: {
                            to,
                            from,
                            cc,
                            subject,
                            attachments,
                          },
                        });
                      } else {
                        this.setState({ emailExtras: {} });
                      }
                    }
                    this.setState({ filePreview: fetchPreviewResult.data.content });
                    // Fetch the file using the ID
                    this.setState({ loading: false });
                  })
                  .catch((fetchPreviewErr) => {
                    Log.info(`Failed to fetch file preview with err: ${fetchPreviewErr}`);
                    openNotificationWithIcon(
                      'error',
                      'Error Getting Preview',
                      'Failed to generate a preview for this file, sorry!',
                    );
                    this.setState({ loading: false });
                  });
              } else {
                this.setState({ loading: false });
              }
            })
            .catch((err) => {
              Log.info(`Failed to fetch file preview with err: ${err}`);
              openNotificationWithIcon(
                'error',
                'Error Getting Preview',
                'Failed to generate a preview for this file, sorry!',
              );
              this.setState({ isAuthenticated: true });
              history.push('/unknown');
            });
          this.setState({ isAuthenticated: true });
        } else if (response.response.status === 400) {
          this.setState({ isAuthenticated: true });
          history.push('/login/expired');
        }
      })
      .catch(() => {
        this.setState({ isAuthenticated: true });
        history.push('/login/expired');
      });
  }

  componentDidUpdate() {
    const { size } = this.state;
    // $FlowFixMe
    const height = document.getElementById('lowerGroup').clientHeight;
    // $FlowFixMe
    const width = document.getElementById('lowerGroup').clientWidth;
    size.height = height;
    size.width = width;
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this._updateDimensions);
  }

  @autobind
  _updateDimensions() {
    const newSize = {};
    // $FlowFixMe
    const height = document.getElementById('lowerGroup').clientHeight;
    // $FlowFixMe
    let width = document.getElementById('lowerGroup').clientWidth;
    if (width <= 1200) {
      width = 1200;
    }
    newSize.height = height;
    newSize.width = width;
    this.setState({ size: newSize });
  }

  @autobind
  // eslint-disable-next-line
  _fetchFilePreview(fileName: string, fileVersion: number, fileId: string) {
    return new Promise((resolve, reject) => {
      const { match } = this.props;
      const { params } = match;
      const { link } = params;
      api
        .getSharedFile(link)
        .then((result) => {
          resolve(result);
        })
        .catch((err) => {
          reject(err);
        });
    });
  }

  @autobind
  _renderFilePreview() {
    const {
      filePreview, mimetype, metadata, emailExtras, fileId, fileName,
    } = this.state;

    if (!filePreview && mimetype !== MIMETYPES.PDF) {
      return (
        <div className="viewDocumentWrapper iframeHolder">
          <Error
            title="Unable to fetch file preview."
            message="We are unable to render a document preview for this file type, sorry!"
          />
        </div>
      );
    }
    const fileVersion = metadata.minVersion;
    const {
      to, from, cc, subject,
    } = emailExtras;
    let attachments;
    if (emailExtras && emailExtras.attachments) {
      attachments = emailExtras.attachments.map(val => val.originalname);
    } else {
      attachments = [''];
    }

    let previewClass = '';
    if (fileId) {
      switch (mimetype) {
        case MIMETYPES.PDF:
          previewClass = 'pdf';
          break;
        case MIMETYPES.PNG:
          previewClass = 'png';
          break;
        case MIMETYPES.JPEG:
          previewClass = 'png';
          break;
        case MIMETYPES.SVG:
          previewClass = 'svg';
          break;
        case MIMETYPES.EMAIL:
          previewClass = 'email';
          break;
        case MIMETYPES.DOC:
        case MIMETYPES.DOCX:
          previewClass = 'docx';
          break;
        case MIMETYPES.XLSX:
          previewClass = 'excel';
          break;
        case MIMETYPES.HTML:
          previewClass = 'html';
          break;
        default:
          previewClass = 'default';
          break;
      }
    }

    switch (mimetype) {
      case MIMETYPES.PDF:
        if (fileVersion) {
          return (
            <div className="viewDocumentWrapper iframeHolder">
              {fileName && (
                <iframe
                  title="proofIFrame"
                  src={`/api/historicalFile/inline/${fileName}/${fileVersion}#view=fitH`}
                  type="application/pdf"
                  width="100%"
                  height="100%"
                />
              )}
            </div>
          );
        }
        return (
          <div className="viewDocumentWrapper iframeHolder">
            {fileId && (
              <iframe
                title="proofIFrame"
                src={`/api/file/inline/${fileId}#view=fitH`}
                type="application/pdf"
                width="100%"
                height="100%"
              />
            )}
          </div>
        );
      case MIMETYPES.EMAIL:
        return (
          <div className="viewDocumentWrapper">
            {emailExtras && (
              <div className="emailExtras">
                <div className="to">
                  <span className="toLabel emailLabel">To: </span>
                  <span className="toValue value">{to}</span>
                </div>
                <div className="from">
                  <span className="fromLabel emailLabel">From: </span>
                  <span className="fromValue value">{from}</span>
                </div>
                <div className="cc">
                  <span className="ccLabel emailLabel">CC: </span>
                  <span className="ccValue value">{cc}</span>
                </div>
                <div className="subject">
                  <span className="subjectLabel emailLabel">Subject: </span>
                  <span className="subjectValue value">{subject}</span>
                </div>
                <div className="attachements">
                  <span className="attachmentsLabel emailLabel">Attachments: </span>
                  <span className="attachmentsValue value">{attachments.join(',  ')}</span>
                </div>
              </div>
            )}
            <div className={`${previewClass}`} dangerouslySetInnerHTML={{ __html: filePreview }} />
          </div>
        );
      case MIMETYPES.XLSX:
        return (
          <div className="viewDocumentWrapper">
            <ExcelPreview excelData={filePreview} />
          </div>
        );
      default:
        if (!filePreview.length) {
          return (
            <div className="viewDocumentWrapper">
              <Error
                title="Unrecognised File Type!"
                message="We are unable to render a document preview for this file type, sorry!"
              />
            </div>
          );
        }
        return (
          <div className="viewDocumentWrapper">
            <div className={`${previewClass}`} dangerouslySetInnerHTML={{ __html: filePreview }} />
          </div>
        );
    }
  }

  @autobind
  _renderProofDiagram() {
    const { proof } = this.state;
    const { status } = proof;
    return (
      <div className="smallProofDiagramWrapper">
        <span className="header">
          <b>Document upload:</b>
          {' '}
In progress.
        </span>
        <div className="subheader">
          <span>
            {' '}
            Your document is currently being proven, please check back here later to view your
            completed proof.
          </span>
          <InfoIcon
            className="infoIcon"
            onClick={() => {
              window.open('https://provendb.com/concepts/proofs');
            }}
          />
        </div>
        <div className="diagram">
          <div className="steps">
            <div className="document">
              <b>Step 1:</b>
              {' '}
              <span>Document</span>
            </div>
            <div className="hash">
              <b>Step 2:</b>
              {' '}
              <span>Hash</span>
            </div>
            <div className="blockchain">
              <b>Step 3:</b>
              {' '}
              <span>Blockchain</span>
            </div>
          </div>
          <div className="line">
            {status && status === PROOF_STATUS.FAILED && <CrossIcon className="crossIcon" />}
            {status && status === PROOF_STATUS.VALID && <TickIcon className="tickIcon" />}
            {status && (status === PROOF_STATUS.PENDING || status === PROOF_STATUS.SUBMITTED) && (
              <TickIcon className="tickIcon" />
            )}
            <div className="hr" />
            {
              // Below is the Hash status icon.
            }
            {status && status === PROOF_STATUS.FAILED && <CrossIcon className="crossIcon" />}
            {status && (status === PROOF_STATUS.VALID || status === PROOF_STATUS.SUBMITTED) && (
              <TickIcon className="tickIcon" />
            )}
            {status && status === PROOF_STATUS.PENDING && <PendingIcon className="pendingIcon" />}
            <div className="hr" />
            {status && status === PROOF_STATUS.FAILED && <CrossIcon className="crossIcon" />}
            {status && status === PROOF_STATUS.VALID && <TickIcon className="tickIcon" />}
            {status && status === PROOF_STATUS.PENDING && <div className="emptyCircle" />}
            {status && status === PROOF_STATUS.SUBMITTED && <PendingIcon className="pendingIcon" />}
          </div>
          <div className="icons">
            <div className="document">
              {status === PROOF_STATUS.PENDING
              || status === PROOF_STATUS.SUBMITTED
              || status === PROOF_STATUS.VALID ? (
                <DocumentIcon className="documentIcon" />
                ) : (
                  <DocumentIcon className="documentIcon faded" />
                )}
              {status === PROOF_STATUS.PENDING
              || status === PROOF_STATUS.SUBMITTED
              || status === PROOF_STATUS.VALID ? (
                <span>Your documents have been hashed.</span>
                ) : (
                  <span className="faded">First your documents are hashed.</span>
                )}
            </div>
            <div className="hash">
              {status === PROOF_STATUS.SUBMITTED || status === PROOF_STATUS.VALID ? (
                <HashIcon className="hashIcon" />
              ) : (
                <HashIcon className="hashIcon faded" />
              )}
              {status === PROOF_STATUS.SUBMITTED || status === PROOF_STATUS.VALID ? (
                <span>Your documents have been submitted to chainpoint.</span>
              ) : (
                <span>Then your documents are hashed together into one hash by Chainpoint.</span>
              )}
            </div>
            <div className="blockchain">
              {status === PROOF_STATUS.SUBMITTED || status === PROOF_STATUS.VALID ? (
                <BlockchainIcon className="blockchainIcon" />
              ) : (
                <BlockchainIcon className="blockchainIcon faded" />
              )}
              {status === PROOF_STATUS.SUBMITTED || status === PROOF_STATUS.VALID ? (
                <span>Your documents are being anchored on the blockchain</span>
              ) : (
                <span>Finally your merged hash is anchored on the blockchain!</span>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  render() {
    const { isAuthenticated } = this.state;
    const { match } = this.props;
    const { params } = match;
    const { link } = params;

    if (isAuthenticated === false) {
      return (
        <div className="App">
          <div className="AppBody">
            <div className="mainPanel">
              <Loading isFullScreen message="Loading, Please wait..." />
            </div>
          </div>
        </div>
      );
    }

    const {
      size, loading, fileName, proofDate, fileSize, proofLoading, proof,
    } = this.state;

    const sizeResult = convertBytes(fileSize, 'b', 3);
    return (
      <div className="App">
        <TopNavBar currentPage={PAGES.DASHBOARD} isAuthenticated />
        <div className="AppBody">
          <div className="mainPanel sharedDocument">
            <div className="pageTitle">
              <div className="left">
                <span className="title">
                  {' '}
                  Document Proof
                  {' '}
                  <span className="fileTitle">{` / ${fileName}`}</span>
                </span>
              </div>
              <div className="right">
                <div className="fileSize">
                  <span className="bold">File Size: </span>
                  <span>{`${sizeResult.value} ${sizeResult.unit}`}</span>
                </div>
                <div className="vr" />
                <div className="fileUploadDate">
                  <span className="bold">Upload Date: </span>
                  <Timestamp time={proofDate} format="full" />
                </div>
              </div>
            </div>
            <div className="lowerGroup" id="lowerGroup">
              <SplitPane
                split="vertical"
                minSize={size.width / 4}
                maxSize={(size.width / 4) * 3}
                defaultSize={size.width / 2}
              >
                <div className="lhs">
                  <div className="viewDocument subWrapper">
                    <div className="contentWrapper">
                      <div className="header">
                        <div className="documentTitle">
                          <b>Document Preview: </b>
                        </div>
                      </div>
                      {loading && (
                        <div className="viewDocumentWrapper">
                          <Loading isFullScreen={false} message="Fetching Document Preview..." />
                        </div>
                      )}
                      {!loading && this._renderFilePreview()}
                    </div>
                  </div>
                </div>
                <div className="rhs">
                  <div className="viewDocument subWrapper">
                    <div className="contentWrapper">
                      <div className="header">
                        <div className="documentTitle">
                          <b>Blockchain Proof</b>
                        </div>
                      </div>
                      <div className="body iframeHolder">
                        {proofLoading && (
                          <Loading isFullScreen={false} message="Fetching Document Proof..." />
                        )}
                        {!proofLoading && proof && proof.status === PROOF_STATUS.VALID && (
                          <iframe
                            title="proofIFrame"
                            src={`/api/getSharedProof/${link}`}
                            type="application/pdf"
                            width="100%"
                            height="100%"
                          />
                        )}
                        {!proofLoading
                          && proof
                          && proof.status !== PROOF_STATUS.VALID
                          && this._renderProofDiagram()}
                      </div>
                    </div>
                  </div>
                </div>
              </SplitPane>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default withRouter(SharedDocument);
