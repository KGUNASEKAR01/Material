import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { viewDetails, requestDetails, requestPost } from 'actions/request.actions';
import {getDetailsWithLib, getListingId} from "config/utility";
import MatRequest from "./MatRequest";
import baseHOC from "./baseHoc";
import { ToastContainer, toast } from 'react-toastify';
// import 'react-toastify/dist/ReactToastify.css';
@connect(state => ({
  viewDetails: state.request.get('viewDetails'),
   requestDet: state.request.get('requestDet'),
}))
@baseHOC
export default class collectionView extends Component {
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
            approveStatus:0,
            multiCategory:[],
            doSuccess : false,
            DOId : this.props.match.params.doid,
            userId : this.props.userId
        };
    this.modifiedRow = [];

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
        if(viewDetails && viewDetailsUpdated && viewDetailsUpdated.request){
            // console.log("log",viewDetails);
            this.setState({requestDetails : viewDetailsUpdated, multiCategory : viewDetails.matRequests, requestStatus:viewDetailsUpdated.request.requestStatus});
                
            viewDetailsUpdated.matRequests.map((data, index) =>{
                // console.log("data", data);
                 this.state[data.categoryUniqueId] = data.quantityDelivered;
            });
        }
        
  }

  
  renderMaterialRequest = (matRequests) =>{

      return matRequests.map((data, index) =>{
          
            let deliveryCount = data.quantityDelivered;
            //  this.state[data.categoryUniqueId+"remain"] = data.quantityRemaining;
        return (
                          <div className="row Listing1 hrline" key={index}>
                            <ul className="Listing">
                                <li className="paddingbottom10">
                                    <div className=" col-lg-4 col-md-4 col-sm-4 col-xs-4"> <span id="lblCategory">{data.categoryId}</span> </div>
                                    <div className=" col-lg-3 col-md-3 col-sm-3 col-xs-3"> <span id="lblSubCategory">{data.subCategoryId}</span> </div>
                                     {data.rawRequestType != 2 &&
                                    <div className=" col-lg-2 col-md-2 col-sm-2 col-xs-2"> <span id="lblQty">{data.quantityDelivered}</span> </div>
                                     }
                                      {data.rawRequestType == 2 &&
                                    <div className=" col-lg-2 col-md-2 col-sm-2 col-xs-2">{data.approx}</div>
                                    }
                                    <div className=" col-lg-3 col-md-3 col-sm-3 col-xs-3">
                                        {(deliveryCount == "0" || (this.props.userType != 5 && this.props.userType != 1 && this.props.userType != 3)) && 
                                        <span>{deliveryCount}</span>
                                        }
                                         {(deliveryCount != "0" && (this.props.userType == 5 || this.props.userType == 1 || this.props.userType == 3)) &&
                                        <input type="number" className="width100" name={data.categoryUniqueId} defaultValue={deliveryCount} onChange={(e)=>{this.onFormChange(e)}}  id="delQty" />
                                         }
                                        
                                        </div>
                                </li>
                                <li class="paddingbottom10"><div class=" col-lg-12 col-md-12 col-sm-12 col-xs-12"> <span id="lblDescription">{data.description}</span></div></li>
                            </ul>
                        </div>
            );
        });


  
}
setApproverComments=(e)=>{
    let comments = e.target.value;
    this.setState({approverComments:comments});

}
setApproverAction=()=>{
     const { dispatch } = this.props;
    //   console.log("state", this.state)
    let errCount=0;
    let {requestDetails} = this.state;
        requestDetails.matRequests.map((data, index) =>{
            // console.log("data", data, this.state[data.categoryUniqueId], data.quantityRemaining, parseInt(this.state[data.categoryUniqueId]) > parseInt(data.quantityRemaining));
            if(parseInt(this.state[data.categoryUniqueId]) > parseInt(data.quantityDelivered)){
                let errMsg = "Acc.Qty should not be more than "+data.quantityDelivered;
                toast.error(errMsg, { autoClose: 3000 });
                errCount++;
            }
        });
      if(errCount === 0){
            this.setState({doSuccess:true});
            this.state.requestCode = 8;
            // this.state.requestStatus = 4;
            this.state.requestIdFormatted = requestDetails.request.reqID;
            this.state.requestType = requestDetails.request.rawRequestType;
            this.state.doIdFormatted = requestDetails.request.activeDoNumber;

            // console.log("state", this.state,requestDetails);

            dispatch(requestPost(this.state));
      }
            
       
}
close = () =>{
    this.props.history.push('/Home'); 
}
setDDOptions = (options, keyName, valueName) =>{
        return options.map((value)=>{
              return (<option key={value[keyName]} value={value[keyName]}>{value[valueName]}</option>);
        });
  }
  modifyRequest = (categoryId, max, e) =>{

    let value = e.target.value;
    if(value.trim() != ""){
     this.modifiedRow[categoryId] = {[categoryId]:value};
    }
    //  console.log(categoryId, this.modifiedRow);
    if(parseInt(value) <= parseInt(max)){
        // this.state.multiCategory = this.modifiedRow;
        // this.setState({[e.target.name]: value});
        this.state[e.target.name] = value;
    }
    else{
        // alert("Value should not be more than "+max);
        // toast.error("Value should not be more than "+max, { autoClose: 3000 });
        // this.state[e.target.name] = max;
        this.setState({[e.target.name]: max});
    }
    // this.onFormChange(e);
  }
   onFormChange = (e) =>{
      
      if(e){
        //   console.log("e", e, e.target.name, e.target.value);
        this.setState({[e.target.name]: e.target.value});
      }
  }
   
  render() {
    const {
      requestDetails, doSuccess
    } = this.state;
     const {requestDet} = this.props;
    return (
      <div>
      
      {requestDetails.request && doSuccess === false && 
            
           
            <div id="detailsApproval">
<ToastContainer autoClose={8000} />
                <div className="padding15">
                    <div className="row Listing1">
                        <label id="items" className="">Collection</label>
                        <ul className="Listing">
                             {requestDetails.request.rawRequestType != 2 &&
                            <li className="paddingbottom10"><strong>DO Number:</strong> <span id="lblNotoficationNo">{requestDetails.request.activeDoNumber}</span></li>
                             }
                              {requestDetails.request.rawRequestType != 3 &&
                             <li className="paddingbottom10"><strong>Notification Number:</strong> <span id="lblNotoficationNo">{requestDetails.request.reqID}</span></li>
                             }
                            <li className="paddingbottom10"><strong>Notification Type:</strong> <span id="lblNotoficationType">{requestDetails.request.requestType}</span></li>
                            <li className="paddingbottom10"><strong>Project Name:</strong> <span id="lblProjectName">{requestDetails.request.projectIdFrom}</span></li>
                             {requestDetails.request.rawRequestType == 3 &&
                            <div>
                            <li className="paddingbottom10"><strong>Project To:</strong> <span id="lblProjectName">{requestDetails.request.projectIdFrom}</span></li>
                             <li className="paddingbottom10"><strong>Notification Number:</strong> <span id="lblProjectName">{requestDetails.request.notificationNumber}</span></li>
                             </div>
                            }
                            <li className="paddingbottom10"><strong>Supervisor:</strong> <span id="lblSupervisor">{requestDetails.request.createdBy}</span></li>
                        </ul>
                        <div className="row Listing1 hrline">
                            <ul className="Listing">
                                <li className="paddingbottom10">
                                    <div className=" col-lg-4 col-md-4 col-sm-4 col-xs-4"> <span id="lblCategory"><strong>Category</strong></span> </div>
                                    <div className=" col-lg-3 col-md-3 col-sm-3 col-xs-3"> <span id="lblSubCategory"><strong>Sub Category</strong></span> </div>
                                     {requestDetails.request.rawRequestType != 2 &&
                                    <div className=" col-lg-2 col-md-2 col-sm-2 col-xs-2"> <span id="lblQty"><strong>Del. Qty</strong></span> </div>
                                     }
                                      {requestDetails.request.rawRequestType == 2 &&
                                    <div className="col-lg-2 col-md-2 col-sm-2 col-xs-2"><strong>Approx</strong></div>
                                    }
                                    <div className=" col-lg-3 col-md-3 col-sm-3 col-xs-3"><strong>Acc. Qty</strong></div>
                                </li>
                            </ul>
                        </div>
                        {requestDetails.matRequests && this.renderMaterialRequest(requestDetails.matRequests) }
                        <div style={{paddingLeft:"20px"}}>{requestDetails.request.description}</div>  
                    </div>

                </div>
                <div className="row height20"></div>
                <ul className="WorkOrderForm" id="DriverInfo" style={{paddingLeft:"20px"}}>
                    <li><strong>Driver Name : </strong>
                   <span id="lblNotoficationNo">{requestDetails.request.driverId}</span>
                        
                    </li>
                    <li><strong>Vechicle No : </strong>
                   <span id="lblNotoficationNo">
                       {requestDetails.request.vehicleId}
                    </span>
                        </li>
                         {requestDetails.request.DORemarks != "" &&
                    <li><strong>DO Remarks: </strong>
                   <span id="lblNotoficationNo">
                       {requestDetails.request.DORemarks}
                    </span>
                        </li>
                    }
                     {requestDetails.request.driverRemarks != "" &&
                    <li><strong>Driver Remarks: </strong>
                   <span id="lblNotoficationNo">
                       {requestDetails.request.driverRemarks}
                    </span>
                        </li>
                    }

                </ul>
 {((this.props.userType == 5 ||  this.props.userType == 1 || this.props.userType == 3) && (requestDetails.request.doStatus == 5 ||requestDetails.request.doStatus == 8 || requestDetails.request.doStatus == 10)) &&
                <ul className="WorkOrderForm" id="approvalCommCont" style={{paddingLeft:"20px"}}>
                    <li><strong>Remarks</strong></li>
                    <li><textarea id="txtComments" name="remarks" onChange={this.onFormChange} className="TextBox" placeholder="Remarks"></textarea></li>
                </ul>
 }
                <div class='row'>
                    {((this.props.userType == 5 ||  this.props.userType == 1 || this.props.userType == 3) && (requestDetails.request.doStatus == 5 ||requestDetails.request.doStatus == 8 ||requestDetails.request.doStatus == 10)) &&
                    <div className="col-xs-4">
                        
                        <input type="button" value="Accept" onClick={this.setApproverAction} id="btSubmit" className="Button btn-block" />
                        
                    </div>
                    }
                    

                    <div className="col-xs-4">
                    </div>

                    <div className="col-xs-4">
                        <input type="button" id="btBack" value="Back" onClick={this.close} className="Button btn-block" />
                    </div>
                </div>
            </div>
      }

{doSuccess === true && 

<div id="DOGenerationAck">
                <div className=""><br /><br /></div>
                <div className="padding15">
                    <div className=" Listing1 padding15">
                        <label id="items" className="">Collection Acknowledegement</label>
                        <p>Accepted Successfully.</p>

                        <p>
                            <br /><br />Regards,
                            <br />Management
                        </p>

                    </div>

                </div>
                <div class='row'>
                    <div className="col-xs-3">
                    </div>
                    <div className="col-xs-5">                        
                        <input type="button" value="Back" onClick={this.close} id="btBack" className="Button btn-block" />
                    </div>
                    <div className="col-xs-4">
                    </div>

                </div>
            </div>
}


            </div>
    
    );
  }
}
