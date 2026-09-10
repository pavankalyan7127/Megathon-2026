export const ROLES = [
  'Frontend Developer',
  'Backend Developer',
  'HR',
  'Project Manager',
  'Business Analyst',
  'Software Architect',
  'DevOps Engineer'
];

export const ROLE_CONFIGS = {
  'Frontend Developer': {
    title: 'Frontend Developer',
    subtitle: 'Client Applications & User Interface Engineering',
    color: 'from-gray-700 to-gray-900',
    badgeColor: 'bg-blue-50 text-blue-700 border-blue-200',
    iconName: 'Layout',
    description: 'Design, implement, and optimize responsive web interfaces and user experiences.',
    quickActions: [

      {
        id: 'build_ui',
        label: 'Build UI Component',
        prompt: 'Build a responsive component with accessible form validation and theme support.',
        icon: 'Palette'
      },
      {
        id: 'fix_bug',
        label: 'Fix UI Bug',
        prompt: 'Diagnose and fix layout shift issue on the employee profile screen.',
        icon: 'Bug'
      },
      {
        id: 'connect_api',
        label: 'Connect API',
        prompt: 'Generate an API integration hook with error handling and caching.',
        icon: 'Unlink'
      },
      {
        id: 'validate_input',
        label: 'Validate Input',
        prompt: 'Implement client-side validation rules for user onboarding forms.',
        icon: 'CheckSquare'
      }
    ],
    samplePrompts: [
      'Build a responsive employee directory table with search and pagination.',
      'Fix UI bug in the authentication state modal.',
      'Connect API endpoint /api/employees to frontend state management.',
      'Validate input for the user registration form.'
    ]
  },

  'Backend Developer': {
    title: 'Backend Developer',
    subtitle: 'Server APIs, Database Services & Business Logic',
    color: 'from-emerald-500 to-teal-500',
    badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    iconName: 'Server',
    description: 'Develop robust REST APIs, manage persistence stores, and enforce server business rules.',
    quickActions: [
      {
        id: 'read_db',
        label: 'Read Database',
        prompt: 'Read the customer records.',
        icon: 'Database'
      },
      {
        id: 'insert_data',
        label: 'Insert Data',
        prompt: 'Insert a new user record into the company directory.',
        icon: 'PlusCircle'
      },
      {
        id: 'update_data',
        label: 'Update Data',
        prompt: 'Update the address of customer 102.',
        icon: 'Edit3'
      },
      {
        id: 'delete_data',
        label: 'Delete Data',
        prompt: 'Clean up the old customer records.',
        icon: 'Trash2'
      },
      {
        id: 'create_api',
        label: 'Create API',
        prompt: 'Create an API for employee management.',
        icon: 'Code'
      },
      {
        id: 'manage_api',
        label: 'Manage API',
        prompt: 'Inspect API endpoints and update rate limiting configuration.',
        icon: 'Sliders'
      }
    ],
    samplePrompts: [
      'Read the customer records.',
      'Update the address of customer 102.',
      'Clean up the old customer records.',
      'Create an API for employee management.'
    ]
  },

  'HR': {
    title: 'HR',
    subtitle: 'Human Resources, Talent Operations & People Management',
    color: 'from-rose-500 to-pink-500',
    badgeColor: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    iconName: 'Users',
    description: 'Manage employee lifecycles, talent acquisition, payroll records, and workplace policies.',
    quickActions: [
      {
        id: 'emp_records',
        label: 'Employee Records',
        prompt: 'Retrieve department headcount and employment verification records.',
        icon: 'Folder'
      },
      {
        id: 'recruitment',
        label: 'Recruitment',
        prompt: 'Draft a job description for Senior Full-Stack Engineer opening.',
        icon: 'UserPlus'
      },
      {
        id: 'interview',
        label: 'Interview',
        prompt: 'Schedule technical interview rounds and prepare competency rubrics.',
        icon: 'Calendar'
      },
      {
        id: 'leave_attendance',
        label: 'Leave / Attendance',
        prompt: 'Show upcoming team leave requests and attendance report for this month.',
        icon: 'Clock'
      },
      {
        id: 'emp_concern',
        label: 'Employee Concern',
        prompt: 'Log and review workplace feedback and resolution recommendations.',
        icon: 'MessageSquare'
      }
    ],
    samplePrompts: [
      'Review pending leave requests for the engineering team.',
      'Draft interview questions for Senior Backend Developer.',
      'Export employee headcount report for Q3 planning.'
    ]
  },

  'Project Manager': {
    title: 'Project Manager',
    subtitle: 'Delivery Governance, Planning & Team Coordination',
    color: 'from-amber-500 to-orange-500',
    badgeColor: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    iconName: 'Kanban',
    description: 'Coordinate cross-functional milestones, sprint allocations, roadmaps, and stakeholder alignment.',
    quickActions: [
      {
        id: 'create_proj',
        label: 'Create Project',
        prompt: 'Initialize a new project milestone for the security compliance roadmap.',
        icon: 'Plus'
      },
      {
        id: 'assign_task',
        label: 'Assign Task',
        prompt: 'Assign the database migration task to the Backend Engineering team.',
        icon: 'UserCheck'
      },
      {
        id: 'set_deadline',
        label: 'Set Deadline',
        prompt: 'Set the MVP launch milestone deadline to the end of next sprint.',
        icon: 'Calendar'
      },
      {
        id: 'track_progress',
        label: 'Track Progress',
        prompt: 'Show me the current project progress.',
        icon: 'BarChart2'
      },
      {
        id: 'stakeholder_comm',
        label: 'Stakeholder Communication',
        prompt: 'Draft an executive status report highlighting deliverables and blockers.',
        icon: 'Send'
      }
    ],
    samplePrompts: [
      'Show me the current project progress.',
      'Generate a summary of sprint velocity and open blockers.',
      'Draft a stakeholder update on the Tripwire integration milestone.'
    ]
  },

  'Business Analyst': {
    title: 'Business Analyst',
    subtitle: 'Business Requirements, User Stories & Domain Modeling',
    color: 'from-purple-500 to-indigo-500',
    badgeColor: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    iconName: 'FileText',
    description: 'Bridge business objectives with technical specifications through precise user stories.',
    quickActions: [
      {
        id: 'gather_req',
        label: 'Gather Requirements',
        prompt: 'Synthesize feature requests from stakeholder interview transcripts.',
        icon: 'Compass'
      },
      {
        id: 'create_story',
        label: 'Create User Story',
        prompt: 'Draft user stories with acceptance criteria for role-based access control.',
        icon: 'FileCode'
      },
      {
        id: 'analyze_need',
        label: 'Analyze Business Need',
        prompt: 'Perform gap analysis between current manual workflow and proposed automation.',
        icon: 'TrendingUp'
      },
      {
        id: 'doc_req',
        label: 'Document Requirement',
        prompt: 'Generate formal Functional Requirement Specification document for AI gateway.',
        icon: 'BookOpen'
      }
    ],
    samplePrompts: [
      'Generate user stories with acceptance criteria for AI agent query logging.',
      'Analyze business requirements for real-time employee attendance tracking.',
      'Create a process flowchart breakdown for the procurement workflow.'
    ]
  },

  'Software Architect': {
    title: 'Software Architect',
    subtitle: 'System Design, Architecture Governance & Tech Standards',
    color: 'from-cyan-500 to-blue-600',
    badgeColor: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
    iconName: 'Cpu',
    description: 'Design resilient distributed topologies, define technology stacks, and oversee system reliability.',
    quickActions: [
      {
        id: 'design_arch',
        label: 'Design Architecture',
        prompt: 'Review high-level architectural diagram for microservices communication.',
        icon: 'Layers'
      },
      {
        id: 'design_db',
        label: 'Design Database',
        prompt: 'Design an event-sourced database schema for audit trail records.',
        icon: 'Database'
      },
      {
        id: 'define_api',
        label: 'Define API',
        prompt: 'Draft OpenAPI 3.0 specification for the agent gateway interface.',
        icon: 'Code'
      },
      {
        id: 'choose_tech',
        label: 'Choose Technology',
        prompt: 'Compare messaging backbones (RabbitMQ vs Kafka) for asynchronous audit feeds.',
        icon: 'CheckCircle'
      },
      {
        id: 'review_security',
        label: 'Review Scalability / Security',
        prompt: 'Assess multi-tenant isolation and failover capabilities across regions.',
        icon: 'Shield'
      }
    ],
    samplePrompts: [
      'Review system architecture for high-throughput webhook processing.',
      'Design database schema for secure multi-tenant employee records.',
      'Define API contracts between frontend and AI agent gateway.'
    ]
  },

  'DevOps Engineer': {
    title: 'DevOps Engineer',
    subtitle: 'Cloud Infrastructure, CI/CD Pipelines & Observability',
    color: 'from-violet-500 to-fuchsia-500',
    badgeColor: 'bg-violet-500/10 text-violet-400 border-violet-500/20',
    iconName: 'Activity',
    description: 'Manage automated deployment pipelines, infrastructure as code, and cluster reliability.',
    quickActions: [
      {
        id: 'deploy_app',
        label: 'Deploy Application',
        prompt: 'Trigger automated blue/green deployment for production release.',
        icon: 'CloudRain'
      },
      {
        id: 'manage_server',
        label: 'Manage Server',
        prompt: 'Check CPU/memory load and scale container replica count.',
        icon: 'HardDrive'
      },
      {
        id: 'cicd',
        label: 'CI/CD Pipeline',
        prompt: 'Validate GitHub Actions workflow for automated linting and security scans.',
        icon: 'GitBranch'
      },
      {
        id: 'monitor_app',
        label: 'Monitor Application',
        prompt: 'Inspect live Prometheus telemetry and request latency percentiles.',
        icon: 'Activity'
      },
      {
        id: 'backup_infra',
        label: 'Backup / Infrastructure',
        prompt: 'Prepare the database for deployment.',
        icon: 'ShieldCheck'
      }
    ],
    samplePrompts: [
      'Prepare the database for deployment.',
      'Inspect production cluster health and resource allocation.',
      'Trigger staging deployment pipeline for v1.2.0.'
    ]
  }
};
