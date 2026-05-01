// Lucide → MUI icon aliases for AdminDashboard, kept in a separate file
// so the AdminDashboard page stays under the 2000-line file limit.
import React from 'react';
import ShieldIcon from '@mui/icons-material/Shield';
import PeopleIcon from '@mui/icons-material/People';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import ChatIcon from '@mui/icons-material/Chat';
import PaletteIcon from '@mui/icons-material/Palette';
import DescriptionIcon from '@mui/icons-material/Description';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import SettingsIcon from '@mui/icons-material/Settings';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import UploadIcon from '@mui/icons-material/Upload';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import EditIcon from '@mui/icons-material/Edit';
import SearchIcon from '@mui/icons-material/Search';
import SendIcon from '@mui/icons-material/Send';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import VideocamIcon from '@mui/icons-material/Videocam';
import PsychologyIcon from '@mui/icons-material/Psychology';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import StorageIcon from '@mui/icons-material/Storage';
import LockIcon from '@mui/icons-material/Lock';
import AddIcon from '@mui/icons-material/Add';
import SchoolIcon from '@mui/icons-material/School';
import CloseIcon from '@mui/icons-material/Close';

const wrap = (I) => ({ size, color, style, className, ...rest }) => (
  <I className={className} style={style} sx={{ fontSize: size || 18, color: color || 'inherit' }} {...rest} />
);

export const Shield = wrap(ShieldIcon);
export const Users = wrap(PeopleIcon);
export const BookOpen = wrap(MenuBookIcon);
export const MessageSquare = wrap(ChatIcon);
export const Palette = wrap(PaletteIcon);
export const FileText = wrap(DescriptionIcon);
export const Award = wrap(EmojiEventsIcon);
export const Settings = wrap(SettingsIcon);
export const Trash2 = wrap(DeleteIcon);
export const CheckCircle = wrap(CheckCircleIcon);
export const Upload = wrap(UploadIcon);
export const Eye = wrap(VisibilityIcon);
export const EyeOff = wrap(VisibilityOffIcon);
export const Edit = wrap(EditIcon);
export const Search = wrap(SearchIcon);
export const Send = wrap(SendIcon);
export const UserCog = wrap(ManageAccountsIcon);
export const Video = wrap(VideocamIcon);
export const Brain = wrap(PsychologyIcon);
export const Calendar = wrap(CalendarTodayIcon);
export const TrendingUp = wrap(TrendingUpIcon);
export const Database = wrap(StorageIcon);
export const Lock = wrap(LockIcon);
export const Plus = wrap(AddIcon);
export const GraduationCap = wrap(SchoolIcon);
export const X = wrap(CloseIcon);