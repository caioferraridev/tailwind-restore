import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/portal/observations')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/portal/observations"!</div>
}
