import { BrowserRouter as HashRouter, Navigate, Route, Routes } from 'react-router-dom'
import LoginPage from './pages/login'
import Navbar from './components/navbar'
import HomePage from './pages/home'
import Mailbox from './pages/mailboxes'
import EmailWarmupDashboard from './pages/mailbox-stats'
import MailboxForm from './pages/add-mailbox'
import ProspectSearch from './pages/prospecting'
import NewCampaign from './pages/new-campaigns'
import LinkedinAuthPage from './pages/add-linkedin'
export const routes = {
    root: '/',
    home: '/home',
    login: '/login',
    mailboxes:'/mailbox',
    mailboxstats:'/mailbox/stats/:id',
    addmailbox:'/add-mailbox',
    prospecting:'/prospecting',
    newcampaign:'/campaigns/new',
    linkedinauth:'/add-linkedin',
}

const AppRouter = () => {
    return (
        <HashRouter>
            <Navbar />
            <Routes>
                <Route path={routes.root} element={<Navigate to={routes.login} />} />
                <Route path={routes.home} element={<HomePage />} />
                <Route path={routes.mailboxes} element={<Mailbox />} />
                <Route path={routes.login} element={<LoginPage />} />
                <Route path={routes.mailboxstats} element={<EmailWarmupDashboard />} />
                <Route path={routes.addmailbox} element={<MailboxForm />} />
                <Route path={routes.prospecting} element={<ProspectSearch />} />
                <Route path={routes.newcampaign} element={<NewCampaign />} />
                <Route path={routes.linkedinauth} element={<LinkedinAuthPage />} />

            </Routes>
        </HashRouter>
    )
}

export default AppRouter
