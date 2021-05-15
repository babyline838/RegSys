const {
  createMuiTheme,
  makeStyles,
  Container,
  CssBaseline,
  ListSubheader,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ThemeProvider,
  Collapse,
  Icon,
  Checkbox,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Paper,
  Card,
  CardActions,
  CardContent,
  Button,
  CardMedia,
  Grid,
  Link,
  Divider,
  Dialog,DialogTitle,MuiDialogTitle,TextField
} = MaterialUI;

const theme = createMuiTheme({
  palette:{
    primary: MaterialUI.colors.blue,
  }
});

const useStyles = makeStyles((theme) => ({
  heroContent: {
    backgroundColor: theme.palette.background.paper,
    padding: theme.spacing(8, 0, 6),
  },
  heroButtons: {
    marginTop: theme.spacing(4),
  },
  cardGrid: {
    paddingTop: theme.spacing(8),
    paddingBottom: theme.spacing(8),
  },
  card: {
    // height: '100%',
    display: 'flex',
    flexDirection: 'column',
  },
  cardMedia: {
    paddingTop: '56.25%', // 16:9
  },
  cardContent: {
    flexGrow: 1,
  },
  footer: {
    backgroundColor: theme.palette.background.paper,
    padding: theme.spacing(6),
  },
  iconhot: {
    color: '#f82',
  },
  iconcold: {
    color: '#6cf',
  },
  form:{
    padding: theme.spacing(3)
  },
  textfield:{
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
    paddingBottom: theme.spacing(1),
  },
  closeButton: {
    position: 'absolute',
    right: theme.spacing(1),
    top: theme.spacing(1),
    color: theme.palette.grey[500],
  },
}));

// const cards = [1, 2, 3, 4, 5, 6, 7, 8, 9];
// const data = [];

function Busy() {
  const classes = useStyles();
  return <Icon className={classes.iconhot}>whatshot</Icon>
}

function Free(){
  const classes = useStyles();
  return (<Icon className={classes.iconcold}>ac_unit</Icon>)
}



function AddDialog(props) {
  const classes = useStyles();
  const { onClose, open } = props;
  const handleClose = () => {
    onClose();
  };
  const IP=React.useRef(null);
  const MAC=React.useRef(null);
  const sshport=React.useRef(null);
  const [gpunum,setgpunum]=React.useState(2);
  const nickname=React.useRef(null);
  const gpuversions=React.useRef(null);
  const handleSubmit = ()=>{
    // debugger
    let promise=fetch('/setstate',{
      method:"POST",
      body:JSON.stringify({
        "IP":IP.current.getElementsByTagName('input')[0].value,
        "MAC":MAC.current.getElementsByTagName('input')[0].value,
        "sshport":Number(sshport.current.getElementsByTagName('input')[0].value),
        "gpunum":Number(gpunum),
        "nickname":nickname.current.getElementsByTagName('input')[0].value,
        "gpuversions":gpuversions.current.getElementsByTagName('input')[0].value,
      }),
      headers:{
        "Content-Type":"application/json"
      }
    })
    onClose();
    promise.then((resp)=>{
      location.reload(true)
    });
  };
  const handlegpunum = (e)=>{
    setgpunum(event.target.value);
  };

  return (
    <Dialog maxWidth='xs' onClose={handleClose} aria-labelledby="simple-dialog-title" open={open}>
      <DialogTitle id="simple-dialog-title">
        Add New Server
        {onClose ? (
        <IconButton aria-label="close" className={classes.closeButton} onClick={onClose}>
          <Icon>close</Icon>
        </IconButton>
        ) : null}
      </DialogTitle>
      <form className={classes.form} noValidate autoComplete="off" style={{textAlign:'center'}}>
        <TextField fullWidth required className={classes.textfield} ref={IP} name="IP" id="IP" label="IP" defaultValue="192.168.x.x"/>
        <TextField fullWidth required className={classes.textfield} ref={MAC} name="MAC" id="MAC" label="MAC" defaultValue="xx:xx:xx:xx:xx:xx"/>
        <TextField fullWidth required className={classes.textfield} ref={sshport} name="sshport" id="sshport" label="SSH Port" defaultValue="22"/>
        <TextField fullWidth required className={classes.textfield} name="gpunum" id="gpunum" label="GPU num" value={gpunum} onChange={handlegpunum}/>
        <TextField fullWidth          className={classes.textfield} ref={nickname} name="nickname" id="nickname" label="Nickname" defaultValue="Server"/>
        <TextField fullWidth required className={classes.textfield} ref={gpuversions} name="gpuversions" id="gpuversions" label="GPU Versions" helperText="Split use ; eg. GTX1080;Titan X;V100"/>
        <Button size="large" variant="contained" color="primary" onClick={handleSubmit}>Add</Button>
      </form>
    </Dialog>
  );
}

function EditDialog(props) {
  const classes = useStyles();
  const info=props.defaultinfo;
  const { onClose, open } = props;
  const handleClose = () => {
    onClose();
  };
  const IP=React.useRef(null);
  const MAC=React.useRef(null);
  const sshport=React.useRef(null);
  const gpunum=React.useRef(null);
  // const [gpunum,setgpunum]=React.useState(info.gpunum);
  const nickname=React.useRef(null);
  let versionstr='';
  if(info.gpus){
    let versions=info.gpus.map((e)=>e[0]);
    for (let i=0;i<versions.length;++i){
      if(i>0)
        versionstr+=';';
      versionstr+=versions[i];
    }
  } else {
    versionstr='';
  }
  const gpuversions=React.useRef(null);
  const handleSubmit = ()=>{
    // debugger
    let promise=fetch('/editstate',{
      method:"POST",
      body:JSON.stringify({
        'id':info.id,
        "IP":IP.current.getElementsByTagName('input')[0].value,
        "MAC":MAC.current.getElementsByTagName('input')[0].value,
        "sshport":Number(sshport.current.getElementsByTagName('input')[0].value),
        "gpunum":Number(gpunum.current.getElementsByTagName('input')[0].value),
        "nickname":nickname.current.getElementsByTagName('input')[0].value,
        "gpuversions":gpuversions.current.getElementsByTagName('input')[0].value,
      }),
      headers:{
        "Content-Type":"application/json"
      }
    })
    onClose();
    promise.then((resp)=>{
      location.reload(true)
    });
  };
  const handlegpunum = (e)=>{
    setgpunum(e.target.value);
  };

  return (
    <Dialog maxWidth='xs' onClose={handleClose} aria-labelledby="simple-dialog-title" open={open}>
      <DialogTitle id="simple-dialog-title">
        Edit Server
        {onClose ? (
        <IconButton aria-label="close" className={classes.closeButton} onClick={onClose}>
          <Icon>close</Icon>
        </IconButton>
        ) : null}
      </DialogTitle>
      <form className={classes.form} noValidate autoComplete="off" style={{textAlign:'center'}}>
        <TextField fullWidth required className={classes.textfield} ref={IP} name="IP" id="IP" label="IP" defaultValue={info.IP}/>
        <TextField fullWidth required className={classes.textfield} ref={MAC} name="MAC" id="MAC" label="MAC" defaultValue={info.MAC}/>
        <TextField fullWidth required className={classes.textfield} ref={sshport} name="sshport" id="sshport" label="SSH Port" defaultValue={info.sshport}/>
        {/*<TextField fullWidth required className={classes.textfield} name="gpunum" id="gpunum" label="GPU num" value={gpunum} onChange={handlegpunum}/>*/}
        <TextField fullWidth required className={classes.textfield} ref={gpunum} name="gpunum" id="gpunum" label="GPU num" defaultValue={info.gpunum}/>
        <TextField fullWidth          className={classes.textfield} ref={nickname} name="nickname" id="nickname" label="Nickname" defaultValue={info.nickname}/>
        <TextField fullWidth required className={classes.textfield} ref={gpuversions} name="gpuversions" id="gpuversions" defaultValue={versionstr} label="GPU Versions" helperText="Split use ; eg. GTX1080;Titan X;V100"/>
        <Button size="large" variant="contained" color="primary" onClick={handleSubmit}>Add</Button>
      </form>
    </Dialog>
  );
}

function ServerItem(props) {
  const info=props.info;
  const handleClickEdit=props.editcallback;
  const classes=useStyles();
  return (
  <Grid item key={info.id} xs={12} sm={6} md={4}>
    <Card className={classes.card}>
      <CardContent className={classes.cardContent}>
        <div display='inline-flex'>
          <Typography variant="h5" className='h2' style={{display:"inline-flex"}}>
            {info.nickname}
          </Typography>
          <IconButton aria-label="edit" color="primary" size='small' onClick={handleClickEdit} style={{display:"inline-flex",float:"right"}}>
            <Icon>edit</Icon>
          </IconButton>
        </div>
        <div>
          <Typography variant="body1">
            IP &nbsp;&nbsp;&nbsp; addr: {info.IP}
          </Typography>
          <Typography variant="body1">
            MAC addr: {info.MAC}
          </Typography>
          <Typography variant="body1">
            SSH port: {info.sshport}
          </Typography>
          <Typography variant="body1">
            GPU num: {info.gpunum}
          </Typography>
          <Divider />
          <List dense={true}>
            {
              info.gpus.map((gpu)=>(
                <React.Fragment>
                <ListItem>
                  <ListItemIcon>
                    {gpu[1]=='none'? <Free/> : <Busy/>}
                  </ListItemIcon>
                  <ListItemText primary={gpu[0]+" | "+gpu[1]}/>
                </ListItem>
                <Divider />
                </React.Fragment>
              ))
            }
          </List>
        </div>
      </CardContent>
    </Card>
  </Grid>);
}

function Album(props) {
  const [openAdd, setOpenAdd] = React.useState(false);
  const [openEdit, setOpenEdit] = React.useState(false);
  const [editinfo, setEditinfo] = React.useState({});
  const handleClickAdd = () => {
    setOpenAdd(true);
  };

  const handleCloseAdd = () => {
    setOpenAdd(false);
  };

  const handleClickEdit = (info) => {
    setEditinfo(info);
    // console.log(info)
    setOpenEdit(true);
  };

  const handleCloseEdit = () => {
    setOpenEdit(false);
  };

  const classes = useStyles();
  const data=props.data;


  return (
    <React.Fragment>
      <CssBaseline />
      <AppBar position="relative">
        <Toolbar>
          <Typography variant="h6" color="inherit" noWrap>
            Album layout
          </Typography>
        </Toolbar>
      </AppBar>
      <main>
        <Container className={classes.cardGrid} maxWidth="md">
          <Grid container spacing={4}>
            {data.map((info) => (<ServerItem info={info} editcallback={()=>handleClickEdit(info)} />))}
            <Grid item key={-1} xs={12} sm={6} md={4}>
              <Card className={classes.card}>
                <CardContent className={classes.cardContent} style={{minHeight:250,textAlign:'center'}}>
                  <Typography gutterBottom variant="h5" component="h2">
                    Add New
                  </Typography>
                  <IconButton color="primary" onClick={handleClickAdd}>
                    <Icon style={{fontSize:'4em'}}>add_circle_outline</Icon>
                  </IconButton>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Container>
      </main>
      <AddDialog open={openAdd} onClose={handleCloseAdd} />
      <EditDialog open={openEdit} onClose={handleCloseEdit} defaultinfo={editinfo} />
    </React.Fragment>
  );
}

let data=[
  {
    id:1,
    nickname:"PC-1",
    IP:"192.168.1.104",
    MAC:"AA:BB:CC:DD:11:22",
    sshport:2254,
    gpunum:4,
    // users:['cka','czm','aaa','none']
    gpus:[['1080','cka'],['1080','czm'],['1080ti','aaa'],['1080ti','aaa']],
  },{
    id:3,
    nickname:"PC-A",
    IP:"192.168.1.114",
    MAC:"AA:EE:CC:DD:11:33",
    sshport:88,
    gpunum:2,
    gpus:[['2080','wt'],['1080ti','wt']],
    // users:['wt','wt']
  },{
    id:4,
    nickname:"PC-5",
    IP:"192.168.1.139",
    MAC:"AA:BB:CC:DD:99:88",
    sshport:22,
    gpunum:3,
    gpus:[['2080','none'],['3090','none'],['3090','none']],
    // users:['none','none','none']
  },
]

fetch('/getstate').then( function(response){
  return response.json();
}).then(data=>{
  console.log(data);
  ReactDOM.render(
    <ThemeProvider theme={theme}>
      <Album data={data}/>
    </ThemeProvider>,
   document.querySelector('#container')
  )
})
