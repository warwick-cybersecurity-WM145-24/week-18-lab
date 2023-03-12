const pulumi = require("@pulumi/pulumi");
const aws = require("@pulumi/aws");

// Create a VPC.
const vpc = new aws.ec2.Vpc("vpc", {
  cidrBlock: "10.0.0.0/22",
});

// Create an an internet gateway.
const gateway = new aws.ec2.InternetGateway("gateway", {
  vpcId: vpc.id,
});

// Create a subnet that automatically assigns new instances a public IP address.
const subnet = new aws.ec2.Subnet("subnet", {
  vpcId: vpc.id,
  cidrBlock: "10.0.1.0/24",
  mapPublicIpOnLaunch: true,
});

// Create a route table for the public subnet
const routes = new aws.ec2.RouteTable("routes", {
  vpcId: vpc.id,
  routes: [
    {
      cidrBlock: "0.0.0.0/0",
      gatewayId: gateway.id,
    },
  ],
});

// Associate the route table with the public subnet.
const routeTableAssociation = new aws.ec2.RouteTableAssociation(
  "route-table-association",
  {
    subnetId: subnet.id,
    routeTableId: routes.id,
  }
);

// Create a security group allowing inbound access over port 80 and outbound
// access to anywhere.
const securityGroup = new aws.ec2.SecurityGroup("security-group", {
  vpcId: vpc.id,
  ingress: [
    {
      cidrBlocks: ["0.0.0.0/0"],
      protocol: "tcp",
      fromPort: 80,
      toPort: 80,
    },
  ],
  egress: [
    {
      cidrBlocks: ["0.0.0.0/0"],
      fromPort: 0,
      toPort: 0,
      protocol: "-1",
    },
  ],
});

// Get the id for the latest Amazon Linux AMI
let ami = aws.ec2
  .getAmi(
    {
      filters: [{ name: "name", values: ["amzn-ami-hvm-*-x86_64-ebs"] }],
      owners: ["amazon"], // Amazon
      mostRecent: true,
    },
    { async: true }
  )
  .then((result) => result);

// create a super simple web server using the startup script for the instance
const userDataScript = `#!/bin/bash
  echo "Hello, World!" > index.html
  nohup python -m SimpleHTTPServer 80 &`;

const instance = new aws.ec2.Instance("web-server-www", {
  tags: { Name: "web-server-www", aws_nuke: "yes" },
  instanceType: instanceSize,
  subnetId: subnet.id,
  vpcSecurityGroupIds: [securityGroup.id], // reference the group object above
  ami: ami.id,
  userData: userDataScript, // start a simple web server
});

// Export the instance's details
module.exports = {
  instanceSize,
  ami,
  instanceURL: pulumi.interpolate`http://${instance.publicDns}`,
  publicIp: instance.publicIp,
};
