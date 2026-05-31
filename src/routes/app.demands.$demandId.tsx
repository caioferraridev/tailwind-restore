import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/app/demands/$demandId')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/app/demands/$demandId"!</div>
}
