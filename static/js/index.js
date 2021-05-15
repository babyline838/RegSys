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
  CardContent,
  FormControlLabel,
  Switch
} = MaterialUI;

const theme = createMuiTheme({
  palette:{
    primary: MaterialUI.colors.blue,
  }
});

const useStyles = makeStyles((theme) => ({
  root: {
    width: '100%',
    // maxWidth: 480,
    backgroundColor: theme.palette.background.default,
  },
  nested: {
    paddingLeft: theme.spacing(2),
    // backgroundColor: theme.palette.primary.light,
    // color: theme.palette.common.white,
  },
}));

function getCookie(cname) {
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for(var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
         }
        if (c.indexOf(name)  == 0) {
            return c.substring(name.length, c.length);
         }
    }
    return "";
}


function MyAppBar(){
  const classes = useStyles();
  return (
    <AppBar position="static">
      <Toolbar variant="dense">
        <IconButton edge="start" className={classes.menuButton} color="inherit" aria-label="menu">
          <Icon>menu</Icon>
        </IconButton>
        <Typography variant="h6" color="inherit">
          Servers
        </Typography>
      </Toolbar>
    </AppBar>
  )
}

function MyListItem(props) {
  const [open, setOpen] = React.useState(true);
  const [states, setStates]= React.useState(props.info.gpus.map((tup)=>tup[1]!=='none'));
  const handleChange = (event) => {
    let name=event.target.name;
    let id=Number(name.substr(6));
    let checked=event.target.checked
    setStates({ ...states, [id]: checked });
    // setinfo({...info.gpus,[id]:event.target.checked?getCookie('name'):'none'});
    setinfo((info)=>{
      info.gpus[id][1]=checked?BASE64.decode(getCookie('name')):'none';
      return info;
    })
    console.log(info)
    // TODO: send request
    let promise=fetch('/setstate',{
      method:"PATCH",
      body:JSON.stringify({
        "computerid":props.info.id,
        "gpuidx":id,
        "user":checked?BASE64.decode(getCookie('name')):'none',
      }),
      headers:{
        "Content-Type":"application/json"
      }
    })
  };
  const classes=useStyles();
  const handleClick = () => {
    setOpen(!open);
  };
  const [info,setinfo]=React.useState(props.info);
  return (
  <div>
    <ListItem button onClick={handleClick}>
      <ListItemIcon><Icon>computer</Icon> </ListItemIcon>
      <ListItemText primary={info.nickname} />
      {open ? <Icon>expand_less</Icon> : <Icon>expand_more</Icon>}
    </ListItem>
    <Collapse in={open}  component="div" timeout="auto" unmountOnExit>
      <Paper className={classes.nested} variant="outlined">
        <Typography variant="body1">
          IP addr: {info.IP}  &emsp;&emsp; MAC addr: {info.MAC}
        </Typography>
        <Typography variant="body1">
          SSH port: {info.sshport} &emsp;&emsp; GPU num: {info.gpunum}
        </Typography>
        {//Render users
        }
        {info.gpus.map((tup,idx)=>
          <div style={{display:'flex',alignItems:'center'}}>
            <Typography variant="body1" style={{flex:'auto',flexBasis:'30%'}}>
              GPU{idx} = {tup[0]}
            </Typography>
            <FormControlLabel
              control={
                (tup[1]=='none'|tup[1]==BASE64.decode(getCookie('name')))?
                  (<Switch checked={states[idx]} name={"switch"+idx} onChange={handleChange} color="primary"/>):
                  (<Switch disabled checked={states[idx]} name={"switch"+idx} onChange={handleChange} color="primary"/>)
              }
              label={tup[1]}
              style={{flex:'auto',flexGrow:3,flexBasis:'70%'}}
            />
          </div>
        )}
      </Paper>
    </Collapse>
  </div>
  );
}

function NestedList(props) {
  const classes = useStyles();
  const items=props.data.map((info)=>(<MyListItem info={info}/>))

  return (
    <List component="nav" aria-labelledby="nested-list-subheader"  className={classes.root}>
      {items}
    </List>
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
    gpus:[['2080','lsy'],['3090','none'],['3090','none']],
    // users:['none','none','none']
  },
]

// ReactDOM.render(
//   <ThemeProvider theme={theme}>
//     <Container maxWidth="sm">
//       <Paper elevation={3}>
//         <MyAppBar />
//         <NestedList data={data}/>
//       </Paper>
//     </Container>
//   </ThemeProvider>,
//  document.querySelector('#container')
// )

fetch('/getstate').then( function(response){
  return response.json();
}).then(data=>{
  console.log(data);
  ReactDOM.render(
    <ThemeProvider theme={theme}>
      <Container maxWidth="sm">
        <Paper elevation={3}>
          <MyAppBar />
          <NestedList data={data}/>
        </Paper>
      </Container>
    </ThemeProvider>,
   document.querySelector('#container')
  )
})
