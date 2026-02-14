import PageContainer from "@/components/ui/PageContainer";
import SectionHeader from "@/components/ui/SectionHeader";
import Card from "@/components/ui/Card";
import ListItem from "@/components/ui/ListItem";
import { Icons } from "@/components/ui/Icons";

export default function Dashboard() {
  return (
    <PageContainer>

      {/* Page Title */}
      <h1 className="text-2xl font-bold text-text-base mb-md">
        Dashboard
      </h1>

      {/* Main Sections */}
      <div className="flex flex-col gap-lg">

        {/* Quick Actions */}
        <div>
          <SectionHeader title="Quick Actions" />
          <Card>
            <div className="flex flex-col gap-sm">
              <ListItem
                title="Nominate for Event"
                icon={Icons.lightning}
                onClick={() => console.log("Nominate")}
              />
              <ListItem
                title="View Upcoming Events"
                icon={Icons.calendar}
                onClick={() => console.log("Events")}
              />
            </div>
          </Card>
        </div>

        {/* Membership */}
        <div>
          <SectionHeader title="Membership" />
          <Card>
            <div className="flex flex-col gap-sm">
              <ListItem
                title="My Profile"
                icon={Icons.user}
                onClick={() => console.log("Profile")}
              />
              <ListItem
                title="My Membership"
                icon={Icons.info}
                onClick={() => console.log("Membership")}
              />
            </div>
          </Card>
        </div>

        {/* Events */}
        <div>
          <SectionHeader title="Events" />
          <Card>
            <div className="flex flex-col gap-sm">
              <ListItem
                title="Event Calendar"
                icon={Icons.calendar}
                onClick={() => console.log("Calendar")}
              />
              <ListItem
                title="Past Results"
                icon={Icons.info}
                onClick={() => console.log("Results")}
              />
            </div>
          </Card>
        </div>

      </div>

    </PageContainer>
  );
}
