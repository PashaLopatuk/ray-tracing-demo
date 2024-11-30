import RenderingParams from './RenderingParams';
import RenderingStatus from './RenderingStatus';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import RenderOut from '@/components/RenderOut';

enum FormType {
  renderingParams = 'renderingParams',
  renderingStatus = 'renderingStatus',
  renderOut = 'renderOut',
}

export default function Forms() {


  return (
    <Card className={'p-5'}>
      <Tabs defaultValue={FormType.renderingParams}>
        <TabsList>
          <TabsTrigger
            value={FormType.renderingParams}
          >
            Rendering Parameters
          </TabsTrigger>

          <TabsTrigger
            value={FormType.renderingStatus}
          >
            Rendering Status
          </TabsTrigger>

          <TabsTrigger
            value={FormType.renderOut}
          >
            Render out
          </TabsTrigger>
        </TabsList>
        <TabsContent
          value={FormType.renderingParams}
        >
          <RenderingParams />
        </TabsContent>
        <TabsContent
          value={FormType.renderingStatus}
        >
          <RenderingStatus />
        </TabsContent>
        <TabsContent value={FormType.renderOut}>
          <RenderOut />
        </TabsContent>
      </Tabs>
    </Card>
  );
}
