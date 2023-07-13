import React from 'react';
import { Button } from 'reactstrap';

const RowButtonComponent = (props) => {
    const { data, onClick, className, name, iconClassName, label} = props;

    var handleClick = () => {
        onClick(data);
    }
    if(name == "ubah-employee" && (data.StatusEmployee =="RESIGN")){
        return (
            <Button className={className} name={name} onClick={handleClick} disabled ><i className={iconClassName}></i>{label}</Button>
        );
    }else if(name == "ubah-employee" && (data.StatusEmployee=="MUTATED")){
      return (
        <Button className={className} name={name} onClick={handleClick}  ><i className={iconClassName}></i>{label}</Button>
      );
    }
    else{
        return (
            <Button className={className} name={name} onClick={handleClick}  ><i className={iconClassName}></i>{label}</Button>
        );
    }
}

export default RowButtonComponent;
