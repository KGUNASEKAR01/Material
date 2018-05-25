import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { viewDetails, requestDetails } from 'actions/request.actions';
import {getDetailsWithLib, getListingId} from "config/utility";
import MatRequest from "./MatRequest";
import baseHOC from "./baseHoc";

@connect(state => ({
  viewDetails: state.request.get('viewDetails'),
   requestDet: state.request.get('requestDet'),
}))
@baseHOC
export default class ViewDetails extends Component {
  static propTypes = {
    counter: PropTypes.number,
    // from react-redux connect
    dispatch: PropTypes.func,
  }
  constructor(props) {
    super(props);

    let listingid = getListingId(this.props.match.params.id);
    // console.log("listingid", listingid);
    this.state = {
            requestCode:3,
            requestStatus:2,
            listingId:listingid,
            requestDetails:{},
            approverComments:"",
            approveStatus:0
        };

    }
  componentDidMount(){
    const { dispatch } = this.props;
    dispatch(requestDetails());
    dispatch(viewDetails(this.state));

  }
  componentWillReceiveProps(nextProps){

        let {viewDetails, requestDet} =  nextProps;
        let viewDetailsUpdated = {};
        if(viewDetails && requestDet){
            viewDetailsUpdated = getDetailsWithLib(viewDetails, requestDet);
        }
        this.setState({requestDetails : viewDetailsUpdated});

  }

  
  renderMaterialRequest = (matRequests) =>{

      return matRequests.map((data, index) =>{
            
        return (
             <div className="row Listing1 hrline" key={index} >
                            <ul className="Listing">
                                <li className="paddingbottom10">
                                    <div className=" col-lg-10 col-md-10 col-sm-10 col-xs-10"> <span id="lblCategory">{data.categoryId}</span> -  <span id="lblSubCategory">{data.subCategoryId}</span> - <span id="lblQty">{data.quantityRequested}</span></div>
                                </li>
                            </ul>
                        </div>
            );
        });


  
}
setApproverComments=(e)=>{
    let comments = e.target.value;
    this.setState({approverComments:comments});

}
setApproverAction=(action)=>{
     const { dispatch } = this.props;
        if(this.state.approverComments !== ""){
            this.setState({commentsError:""});
            this.state.requestCode = 4;
            this.state.approveStatus = action;
            dispatch(viewDetails(this.state));
            this.props.history.push('/Home');    
        }
        else{
            this.setState({commentsError:"Comments mandatory!!"});
        }
}
close = () =>{
    this.props.history.push('/Home'); 
}
   
  render() {
    const {
      requestDetails
    } = this.state;
    
    return (
      <div>
      
      {requestDetails.request &&         
            
           
            <div id="detailsApproval">

                <div className="padding15">
                    <div className="row Listing1">
                        <label id="items" className="">Material Details</label>
                        <ul className="Listing">
                            <li className="paddingbottom10"><strong>Notification Number:</strong> <span id="lblNotoficationNo">{requestDetails.request.requestId}</span></li>
                            <li className="paddingbottom10"><strong>Notification Type:</strong> <span id="lblNotoficationType">{requestDetails.request.requestType}</span></li>
                            <li className="paddingbottom10"><strong>Project Name:</strong> <span id="lblProjectName">{requestDetails.request.projectIdFrom}</span></li>
                            <li className="paddingbottom10"><strong>Supervisor:</strong> <span id="lblSupervisor">{requestDetails.request.createdBy}</span></li>
                        </ul>

                        {requestDetails.matRequests && this.renderMaterialRequest(requestDetails.matRequests) }
                        <div>{requestDetails.request.description}</div>  
                    </div>

                </div>
                {requestDetails.request.requestStatus === "1" &&
                <div>
                <div className="row height20"></div>
                <ul className="WorkOrderForm" id="approvalCommCont">
                    <li className="errorMessage">{this.state.commentsError}</li>
                    <li><strong>Approver Comments</strong></li>
                    <li><textarea id="txtApproverComments" onChange={this.setApproverComments} className="TextBox" placeholder="Approver Comments"></textarea></li>
                </ul>
                <div className='row'>
                    <div className="col-xs-4">
                        
                        <input type="button" value="Approve" onClick={()=>this.setApproverAction(3)} id="btApprove" className="Button btn-block" />
                    </div>

                    <div className="col-xs-4">
                        
                        <input type="button" value="Reject" onClick={()=>this.setApproverAction(6)} id="btReject" className="Button btn-block" />
                    </div>

                    <div className="col-xs-4">
                        <input type="button" id="btClose" value="Close" onClick={this.close} className="Button btn-block" />
                    </div>
                </div>
                </div>
                }
            </div>
      }
            </div>
    
    );
  }
}