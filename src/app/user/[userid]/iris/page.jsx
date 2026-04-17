import React from 'react'

import IrisDashboard from './irisDashoard';

export default async function page({params}) {

      const { userid } = await params;
   return <IrisDashboard userid={userid} />;
}

 