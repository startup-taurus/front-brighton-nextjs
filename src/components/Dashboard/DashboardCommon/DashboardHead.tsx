import React, { ReactNode } from 'react'
import { CardHeader } from 'reactstrap'

type propsType = {
    headClass?: string;
    title: string;
    message?: string;
    spanClass?: string;
    icon?: ReactNode;
}

const DashboardHead = ({ headClass, title, message, spanClass, icon }: propsType) => {
    return (
        <CardHeader className={headClass}>
            <div className="header-top d-flex justify-content-between align-items-center">
                <h5 className="m-0">{title}</h5>
                {icon && <div className="card-header-right-icon">{icon}</div>}
            </div>
            {message && <span className={spanClass ? spanClass : 'f-14 f-w-500 f-light'}>{message}</span>}
        </CardHeader>
    )
}

export default DashboardHead