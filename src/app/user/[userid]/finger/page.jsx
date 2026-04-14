import React from 'react'
import FingerDashboard from './fingerDashboard'

export default async function page({params}) {

      const { userid } = await params;
   return <FingerDashboard userid={userid} />;
}

 