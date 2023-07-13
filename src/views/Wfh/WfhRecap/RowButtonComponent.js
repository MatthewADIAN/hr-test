import React from 'react';
import { Button } from 'reactstrap';

const RowButtonComponent = (props) => {
    const { data, onClick, className, name, iconClassName, label } = props;

    var handleClick = () => {
        onClick(data);
    }

    return (
      <Button className={className} name={name} onClick={handleClick}  ><i className={iconClassName}></i>{label}</Button>
  );

    // if(name == "approve-request" && (data.StatusRequestCode !==1)){
    //     return (
    //         <Button className={className} name={name} onClick={handleClick} disabled ><i className={iconClassName}></i>{label}</Button>
    //     );
    // }else if(name == "reject-request" && (data.StatusRequestCode !==1)){
    //   return (
    //     <Button className={className} name={name} onClick={handleClick} disabled ><i className={iconClassName}></i>{label}</Button>
    //   );
    // }else if((name == "reset-request" && (data.StatusRequestCode ==1))){
    //     return (
    //       <Button className={className} name={name} onClick={handleClick} disabled ><i className={iconClassName}></i>{label}</Button>
    //     );
    //   }
    // else{
    //     return (
    //         <Button className={className} name={name} onClick={handleClick}  ><i className={iconClassName}></i>{label}</Button>
    //     );
    // }

    // return (
    //     <Button className={className} name={name} onClick={handleClick}><i className={iconClassName}></i>{label}</Button>
    // );
}

export default RowButtonComponent;