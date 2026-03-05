import Agent from "@/components/Agent";
import { getCurrentUser } from "@/lib/actions/auth.action";
import React from 'react'

const Page = async () => {
  const user = await getCurrentUser();

  return (
    <>
    
      <h3>Interview generation</h3>
{/* //// AT 3:40 CHECK THE VDO */}
      <Agent
        userName={user?.name!}
        userId={user?.id}
        // you have done here a chnage ?? dont know why 
        
        // profileImage={user?.profileURL}
        type="generate"
      />
    </>
  );
};

export default Page;
